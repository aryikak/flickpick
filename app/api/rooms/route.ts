import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "../../lib/supabase"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()

  // Check if user exists
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single()

  // Create user if they don't exist
  if (!user) {
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)
      return NextResponse.json({ error: "Failed to create user: " + userError.message }, { status: 500 })
    }
    user = newUser
  }

  if (!user) {
    return NextResponse.json({ error: "Could not find or create user" }, { status: 500 })
  }

  // Create room
  const code = nanoid(6).toUpperCase()

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code,
      name: name || "Movie Night",
      created_by: user.id,
    })
    .select()
    .single()

  if (roomError) {
    console.error("Room creation error:", roomError)
    return NextResponse.json({ error: "Failed to create room: " + roomError.message }, { status: 500 })
  }

  // Add creator as member
  await supabase.from("room_members").insert({
    room_id: room.id,
    user_id: user.id,
  })

  return NextResponse.json({ room })
}