// route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

// GET all images (or single by ?id=)
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (id !== null) {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("image_id", id)
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE image by id
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    const { data: existing, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("image_id", id)
      .single();

    if (fetchError) throw fetchError;

    // Remove file from storage if url contains the path
    if (existing?.url) {
      try {
        const url = new URL(existing.url);
        // This is a rough way to extract the path. Adjust based on your actual bucket path.
        // It assumes the URL is like: .../storage/v1/object/public/images/uploads/filename.jpg
        const path = decodeURIComponent(
          url.pathname.split("/").slice(4).join("/")
        ); 
        if (path) {
          await supabase.storage.from("images").remove([path]);
        }
      } catch {
        // ignore parsing errors
      }
    }

    const { error } = await supabase.from("images").delete().eq("image_id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      data: existing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File is required (multipart/form-data with field "file")',
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const path = `uploads/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("images")
      .getPublicUrl(path);

    // Add robustness check for publicUrl
    if (!publicUrl || !publicUrl.publicUrl) {
      throw new Error("Failed to retrieve public URL from Supabase storage.");
    }

    const { data, error } = await supabase
      .from("images")
      .insert([{ filename: file.name, url: publicUrl.publicUrl }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Supabase POST Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "An unknown error occurred during upload." },
      { status: 500 }
    );
  }
}