'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)

  const createRoom = async () => {
  setLoading(true)
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: roomName || "Movie Night" }),
  })
  const data = await res.json()
  console.log("Response:", data)
  
  if (data.error) {
    alert("Error: " + data.error)
    setLoading(false)
    return
  }
  
  router.push(`/room/${data.room.code}`)
  setLoading(false)
}
const joinRoom = async () => {
  if (!joinCode) return
  router.push(`/room/${joinCode}`)
}

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-2">🎬 FlickPick</h1>
      <p className="text-gray-400 mb-12">Hey {session?.user?.name?.split(" ")[0]}! Ready to find a movie?</p>

      <div className="w-full max-w-md space-y-8">
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Create a Room</h2>
          <input
            type="text"
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl mb-4 outline-none"
          />
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl mb-4 outline-none"
          />
          <button
  onClick={joinRoom}
  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
>
  Join Room
</button>
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-12 text-gray-500 hover:text-gray-300 transition text-sm"
      >
        Sign out
      </button>
    </main>
  )
}