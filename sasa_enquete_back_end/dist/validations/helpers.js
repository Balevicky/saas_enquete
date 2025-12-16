// src/validations/helpers.ts
// src/validations/helpers.ts
import { z } from "zod";
export const emptyToUndefined = (v) => (v === "" ? undefined : v);
export const optionalString = () => z.preprocess(emptyToUndefined, z.string().optional());
export const optionalEmail = () => z.preprocess(emptyToUndefined, z.string().email().optional());
export const optionalUrl = () => z.preprocess(emptyToUndefined, z.string().url().optional());
export const optionalBoolean = () => z.preprocess(emptyToUndefined, z.boolean().optional());
export const optionalInt = () => z.preprocess(emptyToUndefined, z.number().int().optional());
// ====================================
// import { z } from "zod";
// export const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
// export const optionalString = () =>
//   z.preprocess(emptyToUndefined, z.string().optional());
// export const optionalEmail = () =>
//   z.preprocess(emptyToUndefined, z.string().email().optional());
// export const optionalUrl = () =>
//   z.preprocess(emptyToUndefined, z.string().url().optional());
