import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key missing" }, { status: 500 })
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
  )
  
  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: "TMDB error: " + text }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ movies: data.results })
}