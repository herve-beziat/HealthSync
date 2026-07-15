import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

type JwtPayload = {
  sub: string
  email: string
  role: string
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Missing token' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verify(token, process.env.JWT_SECRET!, 'HS256') as JwtPayload

    c.set('user', payload)

    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})
