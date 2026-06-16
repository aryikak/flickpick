import { NextRequest, NextResponse } from "next/server"
import { supabase } from "../../lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roomCode = searchParams.get("roomCode")

  if (!roomCode) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 })
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

  // Get all members in room
  const { data: members } = await supabase
    .from("room_members")
    .select("*")
    .eq("room_id", room.id)

  const memberCount = members?.length || 1

  // Get movies that everyone liked
  const { data: votes } = await supabase
    .from("votes")
    .select("*")
    .eq("room_id", room.id)
    .eq("vote", true)

  // Count votes per movie
  const voteCounts: Record<number, number> = {}
  votes?.forEach((v) => {
    voteCounts[v.movie_id] = (voteCounts[v.movie_id] || 0) + 1
  })

  // Find movies where all members voted yes
  const matchedMovieIds = Object.entries(voteCounts)
    .filter(([_, count]) => count >= memberCount)
    .map(([movieId]) => Number(movieId))

  return NextResponse.json({ matchedMovieIds, memberCount })
}