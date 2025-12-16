import api from "../utils/api";
import { TenantSettings } from "../types/tenant";

/**
 * Service de gestion des settings du tenant
 * Tous les appels sont automatiquement authentifiés via api.ts (JWT)
 */
const tenantSettingsApi = {
  /**
   * Récupérer l'ensemble des settings du tenant
   * (general + branding)
   */
  getSettings: async (tenantSlug: string): Promise<TenantSettings> => {
    const { data } = await api.get<{ settings: TenantSettings }>(
      `/t/${tenantSlug}/settings`
    );
    console.log("data.settings", data.settings);

    return data.settings;
  },

  /**
   * Mettre à jour uniquement les settings "General"
   * (organisation, users, emails, security)
   */
  updateGeneral: async (
    tenantSlug: string,
    general: TenantSettings["general"]
  ): Promise<TenantSettings["general"]> => {
    // console.log("{ general }", { general });

    const { data } = await api.put<{ settings: TenantSettings }>(
      `/t/${tenantSlug}/settings/general`,
      { general }
    );
    return data.settings.general;
  },

  /**
   * Mettre à jour uniquement les settings "Branding"
   * (logos, couleurs, apparence)
   */
  updateBranding: async (
    tenantSlug: string,
    branding: TenantSettings["branding"]
  ): Promise<TenantSettings["branding"]> => {
    console.log("{ branding }", { branding });
    const { data } = await api.put<{ settings: TenantSettings }>(
      `/t/${tenantSlug}/settings/branding`,
      { branding }
    );
    return data.settings.branding;
  },
};

export default tenantSettingsApi;
