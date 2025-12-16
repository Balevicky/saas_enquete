export function requireRole(roles) {
    // export function requireRole(...roles: string[]) {
    return (req, res, next) => {
        const userRole = req.userRole; // injecté par authMiddleware
        console.log("userRole", userRole);
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }
        next();
    };
}
