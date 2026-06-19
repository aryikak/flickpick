# FlickPick

Find movies your group will actually agree on.

FlickPick is a full stack group decision app. Create a room, share the code with friends, and everyone swipes on movies. When everyone in the room likes the same movie, it's a match.

**Live app:** [flickpick-iota.vercel.app](https://flickpick-iota.vercel.app)

## Why I built this

Movie night always turns into an hour of scrolling Netflix and nobody agreeing on anything. FlickPick turns that into a quick swiping session that ends with a movie everyone is actually happy with.

## How it works

1. Sign in with Google
2. Create a room or join one with a code
3. Swipe through movies 
4. See live matches as your group swipes, powered by Supabase Realtime
5. Watch the thing everyone agreed on

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Auth:** NextAuth with Google OAuth
- **Database:** Supabase (Postgres)
- **Real-time:** Supabase Realtime subscriptions for live match updates
- **External API:** TMDB for movie data
- **Deployment:** Vercel

## Running locally

```bash
npm install
npm run dev
```

You'll need a `.env.local` file 

```