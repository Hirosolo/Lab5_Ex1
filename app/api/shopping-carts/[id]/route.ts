// app/api/shopping-carts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET single cart item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        users:user_id (user_id, full_name, address),
        products:product_id (product_id, product_name, price)
      `)
      .eq('cart_id', params.id)
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

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Quantity is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shopping_carts')
      .update({ quantity })
      .eq('cart_id', params.id)
      .select(`
        *,
        users:user_id (user_id, full_name),
        products:product_id (product_id, product_name, price)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Shopping cart updated successfully',
      data: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: cartData, error: fetchError } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        users:user_id (user_id, full_name),
        products:product_id (product_id, product_name, price)
      `)
      .eq('cart_id', params.id)
      .single();

    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from('shopping_carts')
      .delete()
      .eq('cart_id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Item removed from shopping cart successfully',
      data: cartData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}