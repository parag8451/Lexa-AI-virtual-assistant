import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
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

    const { prompt, size = "1024x1024", quality = "standard", style = "vivid", generationId } = await req.json();

    if (!prompt || !generationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt and generationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating image for user ${user.id}:`, { prompt, size, quality, style });

    // Use Lovable AI gateway for image generation
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
            content: `Generate a high-quality ${style} style image: ${prompt}. Make it visually stunning and detailed.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image generation API error:", errorText);
      
      // Update generation status to failed
      await supabase
        .from("image_generations")
        .update({ 
          status: "failed", 
          error_message: `API error: ${response.status}` 
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Image generation result received");

    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const revisedPrompt = result.choices?.[0]?.message?.content || prompt;

    if (!imageUrl) {
      console.error("No image URL in response:", result);
      
      await supabase
        .from("image_generations")
        .update({ 
          status: "failed", 
          error_message: "No image generated" 
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload base64 image to storage
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const fileName = `${user.id}/${generationId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl || imageUrl;

    // Update generation record with success
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

    console.log("Image generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        revisedPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Generate image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
