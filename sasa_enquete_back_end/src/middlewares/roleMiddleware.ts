// src/middlewares/rbacMiddleware.ts
import { Request, Response, NextFunction } from "express";

export function requireRole(roles: string[]) {
  // export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole; // injecté par authMiddleware
    console.log("userRole", userRole);

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}
