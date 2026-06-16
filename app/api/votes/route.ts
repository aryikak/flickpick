import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "../../lib/supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { roomCode, movieId, vote } = await req.json()

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single()

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Get room
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", roomCode)
    .single()

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // Save vote
  const { error } = await supabase
    .from("votes")
    .upsert({
      room_id: room.id,
      user_id: user.id,
      movie_id: movieId,
      vote: vote,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}