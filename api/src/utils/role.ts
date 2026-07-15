import { createMiddleware } from 'hono/factory'

/**
 * Middleware de contrôle d'accès par rôle. Accepte une liste de rôles
 * autorisés (ex. requireRole(['admin', 'medecin'])) plutôt qu'un seul rôle,
 * pour couvrir les cas où plusieurs rôles ont accès à une même ressource.
 */
export const requireRole = (roles: string[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')

    if (!roles.includes(user.role)) {
      return c.json({ message: 'Forbidden' }, 403)
    }

    await next()
  })