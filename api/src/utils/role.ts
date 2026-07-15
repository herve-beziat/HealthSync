import { createMiddleware } from 'hono/factory'

export const requireRole = (role: string) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')

    if (user.role !== role) {
      return c.json({ message: 'Forbidden' }, 403)
    }

    await next()
  })