import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, imageUrl, generationId } = await req.json();

    if (!prompt || !imageUrl || !generationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt, imageUrl, and generationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Editing image for user ${user.id}:`, { prompt, imageUrl: imageUrl.substring(0, 50) + "..." });

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Gemini image model with edit instruction
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Edit this image according to the following instruction: ${prompt}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image edit API error:", errorText);

      await supabase
        .from("image_generations")
        .update({
          status: "failed",
          error_message: `API error: ${response.status}`,
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "Image editing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Image edit result received");

    const editedImageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const revisedPrompt = result.choices?.[0]?.message?.content || prompt;

    if (!editedImageUrl) {
      console.error("No edited image URL in response:", result);

      await supabase
        .from("image_generations")
        .update({
          status: "failed",
          error_message: "No edited image generated",
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "No edited image generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload edited image to storage
    const base64Data = editedImageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/${generationId}-edited.png`;

    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl || editedImageUrl;

    // Update generation record
    const { error: updateError } = await supabase
      .from("image_generations")
      .update({
        status: "completed",
        image_url: publicUrl,
        file_path: fileName,
        revised_prompt: revisedPrompt,
      })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    console.log("Image editing completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        revisedPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Edit image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
