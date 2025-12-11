// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';



// GET all users (Using ORM-style with Supabase client)
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id');

    // If an id is provided, return that single user
    if (userId !== null) {

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data
      });
    }

    // Otherwise return all users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new user (Using ORM)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, address } = body;

    if (!full_name) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Using ORM method (Supabase client)
    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name, address }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: data
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id');

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id');

    const body = await req.json();
    const { full_name, address } = body;

    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (address !== undefined) updateData.address = address;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}