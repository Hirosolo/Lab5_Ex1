import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ExternalUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Fetch data from external API
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from external API');
    }

    const externalUsers: ExternalUser[] = await response.json();

    if (!externalUsers || externalUsers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data received from external API'
      }, { status: 404 });
    }

    // Transform data for database insertion
    const usersToInsert = externalUsers.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      website: user.website,
      address_street: user.address.street,
      address_suite: user.address.suite,
      address_city: user.address.city,
      address_zipcode: user.address.zipcode,
      address_geo_lat: parseFloat(user.address.geo.lat),
      address_geo_lng: parseFloat(user.address.geo.lng),
      company_name: user.company.name,
      company_catchphrase: user.company.catchPhrase,
      company_bs: user.company.bs,
    }));

    // Delete existing data (optional - for fresh import)
    const { error: deleteError } = await supabase
      .from('external_users')
      .delete()
      .neq('id', 0); // Delete all rows

    if (deleteError) {
      console.warn('Error deleting existing data:', deleteError);
    }

    // Insert new data using upsert to handle conflicts
    const { data, error } = await supabase
      .from('external_users')
      .upsert(usersToInsert, { onConflict: 'id' })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'External users fetched and saved successfully',
      data: data,
      count: data?.length || 0,
      summary: {
        total_fetched: externalUsers.length,
        total_saved: data?.length || 0,
        source: 'https://jsonplaceholder.typicode.com/users'
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Fetch external users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: 'Failed to fetch or save external users'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to view saved external users
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('external_users')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      message: data?.length 
        ? 'External users retrieved successfully' 
        : 'No external users found. Use POST to fetch and save users.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear external users
export async function DELETE() {
  try {
    const { data: existingData } = await supabase
      .from('external_users')
      .select('*');

    const { error } = await supabase
      .from('external_users')
      .delete()
      .neq('id', 0);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'All external users deleted successfully',
      data: {
        deleted_count: existingData?.length || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}