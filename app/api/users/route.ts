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

// POST - Create new user (Using raw SQL)
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

    // Method 1: Using raw SQL
    const { data, error } = await supabase.rpc('create_user_raw', {
      p_full_name: full_name,
      p_address: address || null
    });

    // If the function doesn't exist, use ORM method
    if (error && error.message.includes('does not exist')) {
      const { data: ormData, error: ormError } = await supabase
        .from('users')
        .insert([{ full_name, address }])
        .select()
        .single();

      if (ormError) throw ormError;

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: ormData
      }, { status: 201 });
    }

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