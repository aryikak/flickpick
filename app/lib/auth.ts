import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single()

      if (!existing) {
        await supabase.from("users").insert({
          email: user.email,
          name: user.name,
          image: user.image,
        })
      }

      return true
    }
  }
}