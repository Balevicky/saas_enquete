// src/validations/tenantValidation.ts
import { z } from "zod";

// ======================
// UPDATE General Settings
// ======================
export const updateGeneralSchema = z.object({
  body: z.object({
    general: z
      .object({
        organisation: z
          .object({
            name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            country: z.string().optional(),
            timezone: z.string().optional(),
            language: z.string().optional(),
          })
          .optional(),
        users: z
          .object({
            allowInvites: z.boolean().optional(),
            defaultRole: z.string().optional(),
            maxUsers: z.number().int().optional(),
          })
          .optional(),
        emails: z
          .object({
            fromName: z.string().optional(),
            fromEmail: z.string().email().optional(),
            replyTo: z.string().email().optional(),
            enabled: z.boolean().optional(),
          })
          .optional(),
        security: z
          .object({
            sessionDuration: z.number().int().optional(),
            passwordPolicy: z.string().optional(),
            twoFactorEnabled: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

// ======================
// UPDATE Branding Settings
// ======================
export const updateBrandingSchema = z.object({
  body: z.object({
    branding: z
      .object({
        logoLight: z.string().url().optional(),
        logoDark: z.string().url().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
      })
      .optional(),
  }),
});

// ======================
// CREATE TENANT
// ======================
export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    ownerEmail: z.string().email().optional(),
    ownerPassword: z.string().min(6).optional(),
    ownerFullName: z.string().optional(),
    settings: z.any().optional(),
  }),
});

// import { z } from "zod";

// export const updateSettingsSchema = z.object({
//   body: z.object({ settings: z.any() }),
// });
// export const createTenantSchema = z.object({
//   body: z.object({ name: z.string().min(2), slug: z.string().min(2) }),
// });
