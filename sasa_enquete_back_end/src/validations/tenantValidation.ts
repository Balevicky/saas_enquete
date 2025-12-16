// src/validations/tenantValidation.ts
// src/validations/tenantValidation.ts
import { z } from "zod";
import {
  optionalString,
  optionalEmail,
  optionalUrl,
  optionalBoolean,
  optionalInt,
} from "./helpers";

// ======================
// UPDATE GENERAL SETTINGS
// ======================
export const updateGeneralSchema = z.object({
  body: z.object({
    general: z.object({
      organisation: z
        .object({
          name: optionalString(),
          email: optionalEmail(),
          country: optionalString(),
          timezone: optionalString(),
          language: optionalString(),
        })
        .optional(),

      users: z
        .object({
          allowInvites: optionalBoolean(),
          defaultRole: optionalString(),
          maxUsers: optionalInt(),
        })
        .optional(),

      emails: z
        .object({
          fromName: optionalString(),
          fromEmail: optionalEmail(),
          replyTo: optionalEmail(),
          enabled: optionalBoolean(),
        })
        .optional(),

      security: z
        .object({
          sessionDuration: optionalInt(),
          passwordPolicy: optionalString(),
          twoFactorEnabled: optionalBoolean(),
        })
        .optional(),
    }),
  }),
});

// ======================
// UPDATE BRANDING SETTINGS
// ======================
export const updateBrandingSchema = z.object({
  body: z.object({
    branding: z.object({
      logoLight: optionalUrl(),
      logoDark: optionalUrl(),
      primaryColor: optionalString(),
      secondaryColor: optionalString(),
    }),
  }),
});

// ======================
// CREATE TENANT
// ======================
export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    ownerEmail: optionalEmail(),
    ownerPassword: z.string().min(6).optional(),
    ownerFullName: optionalString(),
    settings: z.any().optional(),
  }),
});

// =============================
// import { z } from "zod";
// import { optionalString, optionalUrl } from "./helpers";

// // ======================
// // UPDATE General Settings
// // ======================
// const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

// export const updateGeneralSchema = z.object({
//   body: z.object({
//     general: z
//       .object({
//         organisation: z
//           .object({
//             name: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
//             email: z.preprocess(
//               emptyToUndefined,
//               z.string().email().optional()
//             ),
//             country: z.preprocess(emptyToUndefined, z.string().optional()),
//             timezone: z.preprocess(emptyToUndefined, z.string().optional()),
//             language: z.preprocess(emptyToUndefined, z.string().optional()),
//           })
//           .optional(),
//         users: z
//           .object({
//             allowInvites: z.preprocess(
//               emptyToUndefined,
//               z.boolean().optional()
//             ),
//             defaultRole: z.preprocess(emptyToUndefined, z.string().optional()),
//             maxUsers: z.preprocess(
//               emptyToUndefined,
//               z.number().int().optional()
//             ),
//           })
//           .optional(),
//         emails: z
//           .object({
//             fromName: z.preprocess(emptyToUndefined, z.string().optional()),
//             fromEmail: z.preprocess(
//               emptyToUndefined,
//               z.string().email().optional()
//             ),
//             replyTo: z.preprocess(
//               emptyToUndefined,
//               z.string().email().optional()
//             ),
//             enabled: z.preprocess(emptyToUndefined, z.boolean().optional()),
//           })
//           .optional(),
//         security: z
//           .object({
//             sessionDuration: z.preprocess(
//               emptyToUndefined,
//               z.number().int().optional()
//             ),
//             passwordPolicy: z.preprocess(
//               emptyToUndefined,
//               z.string().optional()
//             ),
//             twoFactorEnabled: z.preprocess(
//               emptyToUndefined,
//               z.boolean().optional()
//             ),
//           })
//           .optional(),
//       })
//       .optional(),
//   }),
// });

// // ======================
// // UPDATE Branding Settings
// // ======================

// export const updateBrandingSchema = z.object({
//   body: z.object({
//     branding: z.object({
//       logoLight: optionalUrl(),
//       logoDark: optionalUrl(),
//       primaryColor: optionalString(),
//       secondaryColor: optionalString(),
//     }),
//   }),
// });
// // export const updateBrandingSchema = z.object({
// //   body: z.object({
// //     branding: z
// //       .object({
// //         logoLight: z.string().url().optional(),
// //         logoDark: z.string().url().optional(),
// //         primaryColor: z.string().optional(),
// //         secondaryColor: z.string().optional(),
// //       })
// //       .optional(),
// //   }),
// // });

// // ======================
// // CREATE TENANT
// // ======================
// export const createTenantSchema = z.object({
//   body: z.object({
//     name: z.string().min(2),
//     slug: z.string().min(2),
//     ownerEmail: z.string().email().optional(),
//     ownerPassword: z.string().min(6).optional(),
//     ownerFullName: z.string().optional(),
//     settings: z.any().optional(),
//   }),
// });

// import { z } from "zod";

// export const updateSettingsSchema = z.object({
//   body: z.object({ settings: z.any() }),
// });
// export const createTenantSchema = z.object({
//   body: z.object({ name: z.string().min(2), slug: z.string().min(2) }),
// });
