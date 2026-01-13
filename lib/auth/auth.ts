import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24 * 2,
        // disableSessionRefresh: true,
    },
    user: {
        additionalFields: {
            username: {
                type: 'string',
                required: false,
            },
            bio: {
                type: 'string',
                required: false,
            },
            avatar: {
                type: 'string',
                required: false,
            },
        },
        plugins: [nextCookies()],
    },
})

export type Session = typeof auth.$Infer.Session
export type SessionUser = typeof auth.$Infer.Session.user
