// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
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
    if (manufacturing_date !== undefined) updateData.manufacturing_date = manufacturing_date;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('product_id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: data
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: productData, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', params.id)
      .single();

    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('product_id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: productData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}