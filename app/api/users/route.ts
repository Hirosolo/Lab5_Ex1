// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all users (Using ORM-style with Supabase client)
export async function GET() {
  try {
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
