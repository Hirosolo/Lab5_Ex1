// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET single or all product
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", id)
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        data: data,
      });
    }
    const { data, error } = await supabase.from("products").select("*");
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    );
  }
}

// Post product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_name, price, manufacturing_date } = body;
    if (!product_name || !price || !manufacturing_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name, price and manufacturing date are required",
        },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("products")
      .insert([{ product_name, price, manufacturing_date }])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { product_name, price, manufacturing_date } = body;

    const updateData: any = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (price !== undefined) updateData.price = price;
    if (manufacturing_date !== undefined)
      updateData.manufacturing_date = manufacturing_date;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("product_id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest
) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const { data: productData, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("product_id", id)
      .single();

    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("product_id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      data: productData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
