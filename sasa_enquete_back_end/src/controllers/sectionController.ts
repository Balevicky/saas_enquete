import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * Sections = groupes de questions d’un survey
 * Multi-tenant strict
 */
export class SectionController {
  /**
   * 🔹 Lister les sections d’un survey
   */
  static async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;

      const sections = await prisma.section.findMany({
        where: {
          surveyId,
          tenantId,
        },
        orderBy: {
          position: "asc",
        },
      });

      res.json(sections);
    } catch (error) {
      console.error("Section.list error:", error);
      res
        .status(500)
        .json({ message: "Erreur lors du chargement des sections" });
    }
  }

  /**
   * 🔹 Créer une section
   */
  static async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { surveyId } = req.params;
      const { title, description } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Le titre est obligatoire" });
      }

      const position = await prisma.section.count({
        where: { surveyId, tenantId },
      });

      const section = await prisma.section.create({
        data: {
          surveyId,
          tenantId,
          title: title.trim(),
          description,
          position,
        },
      });

      res.status(201).json(section);
    } catch (error) {
      console.error("Section.create error:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la création de la section" });
    }
  }

  /**
   * 🔹 Mettre à jour une section (titre / description / position)
   */
  static async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id } = req.params;
      const { title, description, position } = req.body;

      const existing = await prisma.section.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({ message: "Section introuvable" });
      }

      const section = await prisma.section.update({
        where: { id },
        data: {
          title,
          description,
          position,
        },
      });

      res.json(section);
    } catch (error) {
      console.error("Section.update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
  }

  /**
   * 🔹 Supprimer une section
   * ⚠️ Les questions sont mises à sectionId = null (ou supprimées si tu changes la règle)
   */
  static async remove(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { id } = req.params;

      const existing = await prisma.section.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({ message: "Section introuvable" });
      }

      await prisma.section.delete({
        where: { id },
      });

      //   res.sendStatus(204);
      //   return res.status(204).json({
      res.status(200).json({
        message: "Section supprimée!!:",
        id: id,
      });
    } catch (error) {
      console.error("Section.remove error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  }
}
