import { clerkMiddleware } from '@clerk/tanstack-react-start/server'

export const middleware = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
})