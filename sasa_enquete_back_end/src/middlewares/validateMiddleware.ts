import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      console.log("❌ BRANDING ZOD ERROR", result.error.flatten());
      // return res.status(400).json({ errors: result.error.flatten() });
      return res.status(400).json({ errors: result.error.flatten() });
    }
    next();
  };
