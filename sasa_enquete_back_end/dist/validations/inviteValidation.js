import { z } from 'zod';
export const createInviteSchema = z.object({
    body: z.object({
        email: z.string().email(),
        role: z.enum(['USER', 'ADMIN']).optional(),
    }),
});
export const acceptInviteSchema = z.object({
    body: z.object({
        token: z.string(),
        fullName: z.string().min(2).optional(),
        password: z.string().min(6).optional(),
    }),
});
