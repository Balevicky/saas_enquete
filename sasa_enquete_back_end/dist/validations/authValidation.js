import { z } from "zod";
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
});
// Register a user into an existing tenant (must have x-tenant-slug or tenant extracted)
export const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().min(2).optional(),
    }),
});
// Signup creates a new tenant + owner user
export const signupTenantSchema = z.object({
    body: z.object({
        tenantName: z.string().min(2),
        tenantSlug: z
            .string()
            .min(2)
            .regex(/^[a-z0-9-]+$/),
        ownerEmail: z.string().email(),
        ownerPassword: z.string().min(6),
        ownerFullName: z.string().min(2).optional(),
    }),
});
export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
});
export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string(),
        password: z.string().min(6),
    }),
});
