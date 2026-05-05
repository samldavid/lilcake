import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { loginSchema } from "@/lib/validations"
import {
  buildRateLimitKey,
  consumeRateLimit,
  resetRateLimit,
} from "@/lib/rate-limit"
import {
  hasAcceptedTermsCookie,
  TERMS_CONSENT_COOKIE_NAME,
} from "@/lib/legal-consent"

const DEFAULT_INSECURE_NEXTAUTH_SECRET =
  "lilcake-dev-secret-change-in-production-2026"

function assertSecureNextAuthSecret() {
  if (
    process.env.NODE_ENV !== "production" ||
    (!process.env.VERCEL && process.env.ENFORCE_STRICT_ENV !== "true")
  ) {
    return
  }

  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error("Falta NEXTAUTH_SECRET en produccion.")
  }

  if (
    secret === DEFAULT_INSECURE_NEXTAUTH_SECRET ||
    secret.trim().length < 32
  ) {
    throw new Error(
      "NEXTAUTH_SECRET debe ser robusto y distinto al valor de ejemplo en produccion."
    )
  }
}

assertSecureNextAuthSecret()

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

async function hasTermsConsentForGoogleSignup(email?: string | null) {
  if (!email) {
    return false
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  })

  if (existingUser) {
    return true
  }

  const cookieStore = await cookies()
  return hasAcceptedTermsCookie(
    cookieStore.get(TERMS_CONSENT_COOKIE_NAME)?.value
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const googleProfile =
          profile && typeof profile === "object"
            ? (profile as { email_verified?: boolean })
            : null

        if (googleProfile?.email_verified !== true) {
          return false
        }

        const acceptedTerms = await hasTermsConsentForGoogleSignup(user.email)

        if (!acceptedTerms) {
          return "/registro?error=terms"
        }
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
  events: {
    async linkAccount({ user, account }) {
      if (account.provider !== "google") {
        return
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      })
    },
  },
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
        if (profile.email_verified !== true || !profile.email) {
          throw new Error("El correo de Google debe estar verificado.")
        }

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
      password: { label: "Contrasena", type: "password" },
    },
    async authorize(credentials) {
      const parse = loginSchema.safeParse(credentials)

      if (!parse.success) {
        throw new Error("Credenciales invalidas")
      }

      const normalizedEmail = parse.data.email.toLowerCase().trim()
      const loginRateLimitKey = buildRateLimitKey("auth-login", [
        normalizedEmail,
      ])
      const loginRateLimit = consumeRateLimit({
        key: loginRateLimitKey,
        limit: 5,
        windowMs: 15 * 60 * 1000,
      })

      if (!loginRateLimit.allowed) {
        throw new Error("Demasiados intentos. Intenta de nuevo en unos minutos.")
      }

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (!user?.password) {
        throw new Error("Credenciales invalidas")
      }

      const passwordMatch = await bcrypt.compare(
        parse.data.password,
        user.password
      )

      if (!passwordMatch) {
        throw new Error("Credenciales invalidas")
      }

      resetRateLimit(loginRateLimitKey)

      return {
        id: user.id,
        name: user.name || "",
        email: user.email || normalizedEmail,
        role: user.role,
      }
    },
  })
)
