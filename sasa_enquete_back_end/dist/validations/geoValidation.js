import { z } from 'zod';
export const createRegionSchema = z.object({
    body: z.object({
        name: z.string().min(2),
    }),
});
export const updateRegionSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
    }),
});
export const createDepartementSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        regionId: z.string().cuid(),
    }),
});
export const updateDepartementSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
    }),
});
export const createSecteurSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        departementId: z.string().cuid(),
    }),
});
export const updateSecteurSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
    }),
});
export const createVillageSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        secteurId: z.string().cuid(),
    }),
});
export const updateVillageSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
    }),
});
