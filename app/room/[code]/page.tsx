'use client'

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RoomPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [movies, setMovies] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchedMovies, setMatchedMovies] = useState<any[]>([])
  const [likedMovies, setLikedMovies] = useState<any[]>([])
  const [showPanel, setShowPanel] = useState<'matches' | 'likes' | null>(null)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`/api/movies`)
      if (!res.ok) return
      const data = await res.json()
      setMovies(data.movies || [])
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch movies:", err)
      setLoading(false)
    }
  }

  const vote = async (liked: boolean) => {
    const movie = movies[currentIndex]
    await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomCode: code,
        movieId: movie.id,
        vote: liked,
      }),
    })
    if (liked) {
      setLikedMovies((prev) => [...prev, movie])
    }
    setCurrentIndex((prev) => prev + 1)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading movies...</p>
      </main>
    )
  }

  const currentMovie = movies[currentIndex]

  if (!currentMovie) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-2">You're done swiping!</h1>
        <p className="text-gray-400 mb-8">Share this code with your group:</p>
        <div className="bg-gray-800 px-6 py-3 rounded-2xl text-3xl font-mono font-bold mb-8 tracking-widest">
          {code}
        </div>
        <MatchesPanel roomCode={code} />
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 text-gray-500 hover:text-gray-300 transition text-sm"
        >
          Back to Dashboard
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">🎬 FlickPick</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPanel(showPanel === 'likes' ? null : 'likes')}
              className="bg-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition"
            >
              ❤️ {likedMovies.length}
            </button>
            <button
              onClick={() => setShowPanel(showPanel === 'matches' ? null : 'matches')}
              className="bg-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition"
            >
              🎉 {matchedMovies.length}
            </button>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-mono">{code}</span>
          </div>
        </div>

        {/* Sliding Panel */}
        {showPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-end justify-center" onClick={() => setShowPanel(null)}>
            <div className="bg-gray-900 rounded-t-3xl p-6 w-full max-w-sm max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{showPanel === 'matches' ? '🎉 Group Matches' : '❤️ My Likes'}</h2>
                <button onClick={() => setShowPanel(null)} className="text-gray-400">✕</button>
              </div>
              {showPanel === 'matches' && (
                <MatchesPanel roomCode={code} onMatchesUpdate={setMatchedMovies} />
              )}
              {showPanel === 'likes' && (
                <div className="space-y-3">
                  {likedMovies.length === 0 ? (
                    <p className="text-gray-400 text-center">Nothing liked yet!</p>
                  ) : (
                    likedMovies.map((movie) => (
                      <div key={movie.id} className="flex gap-4 bg-gray-800 rounded-2xl p-3 items-center">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-10 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm">{movie.title}</p>
                          <p className="text-gray-400 text-xs">{movie.release_date?.split("-")[0]} • ⭐ {movie.vote_average?.toFixed(1)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movie Card */}
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
            alt={currentMovie.title}
            className="w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h2 className="text-2xl font-bold">{currentMovie.title}</h2>
            <p className="text-gray-300 text-sm mt-1">{currentMovie.release_date?.split("-")[0]} • ⭐ {currentMovie.vote_average?.toFixed(1)}</p>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{currentMovie.overview}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={() => vote(false)}
            className="w-16 h-16 bg-gray-800 rounded-full text-3xl hover:bg-red-900 transition flex items-center justify-center"
          >
            ❌
          </button>
          <button
            onClick={() => vote(true)}
            className="w-16 h-16 bg-gray-800 rounded-full text-3xl hover:bg-green-900 transition flex items-center justify-center"
          >
            ✅
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">{movies.length - currentIndex - 1} movies left</p>
      </div>
    </main>
  )
}

function MatchesPanel({ roomCode, onMatchesUpdate }: { roomCode: string, onMatchesUpdate?: (movies: any[]) => void }) {
  const [movieDetails, setMovieDetails] = useState<any[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch(`/api/matches?roomCode=${roomCode}`)
      const data = await res.json()
      if (data.matchedMovieIds?.length > 0) {
        const details = await Promise.all(
          data.matchedMovieIds.map((id: number) =>
            fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
              .then((r) => r.json())
          )
        )
        setMovieDetails(details)
        onMatchesUpdate?.(details)
      }
    }

    fetchMatches()

    const channel = supabase
      .channel(`votes-${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => fetchMatches()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  if (movieDetails.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400">No matches yet — waiting for your group...</p>
        <p className="text-gray-600 text-sm mt-2">Updates in real time</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {movieDetails.map((movie) => (
        <div key={movie.id} className="flex gap-4 bg-gray-800 rounded-2xl p-3 items-center">
          <img
            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
            alt={movie.title}
            className="w-10 h-14 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-sm">{movie.title}</p>
            <p className="text-gray-400 text-xs">{movie.release_date?.split("-")[0]} • ⭐ {movie.vote_average?.toFixed(1)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}