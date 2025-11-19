import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"

// Build providers array conditionally based on available credentials
const providers: any[] = []

// Add GitHub provider if credentials exist
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  )
}

// Add Google provider if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Add guest/demo credentials provider as fallback
providers.push(
  Credentials({
    name: "Guest",
    credentials: {
      name: { label: "Name", type: "text", placeholder: "Enter your name" },
    },
    async authorize(credentials) {
      if (!credentials?.name) {
        return null
      }

      // Find or create user with this name
      let user = await prisma.user.findFirst({
        where: { name: credentials.name as string }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: credentials.name as string,
            email: `${(credentials.name as string).toLowerCase().replace(/\s+/g, '')}@guest.local`,
          },
        })
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    },
  })
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = token?.sub || user?.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
