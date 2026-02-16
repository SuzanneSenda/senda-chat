import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Get current user to verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin/supervisor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (err) {
    console.error('Admin users API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Update user (phone number, etc)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Get current user to verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin/supervisor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { userId, phone } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Update user phone
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin users PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Get current user to verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is supervisor (only supervisors can delete)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'supervisor') {
      return NextResponse.json({ error: 'Solo supervisores pueden eliminar usuarios' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    // Delete user profile (this will cascade or leave auth user orphaned)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin users DELETE error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
