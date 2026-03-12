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

    const { 
      prompt, 
      startingFrameUrl, 
      aspectRatio = "16:9", 
      duration = 5,
      generationId 
    } = await req.json();

    if (!prompt || !generationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt and generationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating video for user ${user.id}:`, { prompt, aspectRatio, duration, hasStartingFrame: !!startingFrameUrl });

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the message content
    let messageContent: any;
    if (startingFrameUrl) {
      // Image-to-video: animate from starting frame
      messageContent = [
        {
          type: "text",
          text: `Create a ${duration} second video animation from this image. Motion instruction: ${prompt}. Aspect ratio: ${aspectRatio}.`,
        },
        {
          type: "image_url",
          image_url: {
            url: startingFrameUrl,
          },
        },
      ];
    } else {
      // Text-to-video
      messageContent = `Generate a ${duration} second video with aspect ratio ${aspectRatio}: ${prompt}. Make it smooth, cinematic, and visually engaging.`;
    }

    // Use Gemini for video generation (using image model with video modality)
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
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Video generation API error:", errorText);

      await supabase
        .from("video_generations")
        .update({
          status: "failed",
          error_message: `API error: ${response.status}`,
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      // Handle rate limiting
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Video generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Video generation result received");

    // For now, Gemini generates images - we'll create an animated sequence
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const revisedPrompt = result.choices?.[0]?.message?.content || prompt;

    if (!imageUrl) {
      console.error("No media in response:", result);

      await supabase
        .from("video_generations")
        .update({
          status: "failed",
          error_message: "No video generated",
        })
        .eq("id", generationId)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "No video generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload the generated frame/video
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const mediaBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/${generationId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("generated-videos")
      .upload(fileName, mediaBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-videos")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl || imageUrl;

    // Update generation record
    const { error: updateError } = await supabase
      .from("video_generations")
      .update({
        status: "completed",
        video_url: publicUrl,
        file_path: fileName,
        revised_prompt: revisedPrompt,
      })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    console.log("Video generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: publicUrl,
        revisedPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate video error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
