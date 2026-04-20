import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { loginSchema } from "@/lib/validations"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  callbacks: {
    async signIn({ user, account }) {
      if (
        account?.provider === "google" &&
        typeof user.id === "string" &&
        user.email
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
          },
        })
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }

      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const googleAuthEnabled = Boolean(googleClientId && googleClientSecret)

if (googleAuthEnabled) {
  authOptions.providers.push(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
        }
      },
    })
  )
}

authOptions.providers.push(
  CredentialsProvider({
    name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
    async authorize(credentials) {
      const parse = loginSchema.safeParse(credentials)

      if (!parse.success) {
        throw new Error("Credenciales inválidas")
      }

      const user = await prisma.user.findUnique({
        where: { email: parse.data.email.toLowerCase().trim() },
      })

      if (!user?.password) {
        throw new Error("Credenciales inválidas")
      }

      const passwordMatch = await bcrypt.compare(
        parse.data.password,
        user.password
      )

      if (!passwordMatch) {
        throw new Error("Credenciales inválidas")
      }

      return {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
      }
    },
  })
)
