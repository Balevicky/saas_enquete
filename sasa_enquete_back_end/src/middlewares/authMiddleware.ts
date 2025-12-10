import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const parts = auth.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ error: "Invalid auth header" });

  try {
    const payload: any = jwt.verify(parts[1], JWT_SECRET);
    // ensure tenant match
    if ((req as any).tenantId && payload.tenantId !== (req as any).tenantId) {
      return res.status(403).json({ error: "Token tenant mismatch" });
    }

    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
