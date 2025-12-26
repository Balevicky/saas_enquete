// src/services/sectionService.ts
import api from "../utils/api";

/**
 * 🔹 Type Section
 * Représente un groupe de questions dans un survey
 * Doit refléter exactement le modèle Prisma + les retours du backend
 */
export interface Section {
  id: string;
  surveyId: string;
  tenantId?: string; // souvent non utilisé côté front mais retourné par l’API
  title: string;
  description?: string | null;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 🔹 Service frontend pour les sections
 * S’inspire directement de questionService.ts
 */
const sectionService = {
  /**
   * ======================
   * 🔹 LISTER LES SECTIONS D’UN SURVEY
   * ======================
   * Correspond à :
   * GET /t/:tenantSlug/surveys/:surveyId/sections
   *
   * Backend :
   * SectionController.list
   */
  list: async (tenantSlug: string, surveyId: string): Promise<Section[]> => {
    const res = await api.get<Section[]>(
      `/t/${tenantSlug}/surveys/${surveyId}/sections`
    );

    return res.data;
  },

  /**
   * ======================
   * 🔹 CRÉER UNE SECTION
   * ======================
   * Correspond à :
   * POST /t/:tenantSlug/surveys/:surveyId/sections
   *
   * Backend :
   * SectionController.create
   *
   * ⚠️ position calculée automatiquement côté backend
   */
  create: async (
    tenantSlug: string,
    surveyId: string,
    data: {
      title: string;
      description?: string;
    }
  ): Promise<Section> => {
    const res = await api.post<Section>(
      `/t/${tenantSlug}/surveys/${surveyId}/sections`,
      data
    );

    return res.data;
  },

  /**
   * ======================
   * 🔹 METTRE À JOUR UNE SECTION
   * ======================
   * Correspond à :
   * PUT /t/:tenantSlug/sections/:id
   *
   * Backend :
   * SectionController.update
   *
   * Permet :
   * - renommer une section
   * - modifier la description
   * - changer la position (drag & drop)
   */
  update: async (
    tenantSlug: string,
    id: string,
    data: Partial<{
      title: string;
      description?: string | null;
      position: number;
    }>
  ): Promise<Section> => {
    const res = await api.put<Section>(`/t/${tenantSlug}/sections/${id}`, data);

    return res.data;
  },

  /**
   * ======================
   * 🔹 SUPPRIMER UNE SECTION
   * ======================
   * Correspond à :
   * DELETE /t/:tenantSlug/sections/:id
   *
   * Backend :
   * SectionController.remove
   *
   * ⚠️ Les questions associées passent à sectionId = null
   */
  remove: async (tenantSlug: string, id: string): Promise<void> => {
    await api.delete(`/t/${tenantSlug}/sections/${id}`);
  },

  // ✅ 🔥 REORDER (drag & drop)
  reorder: async (
    tenantSlug: string,
    surveyId: string,
    sectionId: string,
    targetPosition: number
  ): Promise<void> => {
    await api.post(
      `/t/${tenantSlug}/surveys/${surveyId}/sections/${sectionId}/reorder`,
      { targetPosition }
    );
  },
};

export default sectionService;
