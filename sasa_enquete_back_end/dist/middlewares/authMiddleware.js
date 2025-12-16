import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ error: "Missing authorization" });
    const parts = auth.split(" ");
    if (parts.length !== 2)
        return res.status(401).json({ error: "Invalid auth header" });
    try {
        const payload = jwt.verify(parts[1], JWT_SECRET);
        // ensure tenant match
        if (req.tenantId && payload.tenantId !== req.tenantId) {
            return res.status(403).json({ error: "Token tenant mismatch" });
        }
        req.user = payload;
        req.userId = payload.userId;
        req.tenantId = payload.tenantId;
        req.userRole = payload.role; // ✅ LIGNE MANQUANTE
        console.log("JWT tenant dans authmidle:", req.user.tenantId);
        console.log("URL tenant dans authmidle:", req.params.slug);
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
