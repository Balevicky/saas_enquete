import api from "../utils/api";

const geoService = {
  // REGIONS
  createRegion: (tenantSlug: string, name: string) =>
    api.post(`/t/${tenantSlug}/regions`, { name }),
  // listRegions: (tenantSlug: string) => api.get(`/t/${tenantSlug}/regions`),
  listRegions: (tenantSlug: string, query: any = {}) =>
    api.get(`/t/${tenantSlug}/regions`, { params: query }),
  updateRegion: (tenantSlug: string, id: string, data: any) =>
    api.put(`/t/${tenantSlug}/regions/${id}`, data),
  deleteRegion: (tenantSlug: string, id: string) =>
    api.delete(`/t/${tenantSlug}/regions/${id}`),

  // DEPARTEMENTS
  createDepartement: (tenantSlug: string, data: any) =>
    api.post(`/t/${tenantSlug}/departements`, data),
  listDepartements: (tenantSlug: string, query = {}) =>
    api.get(`/t/${tenantSlug}/departements`, { params: query }),
  updateDepartement: (tenantSlug: string, id: string, data: any) =>
    api.put(`/t/${tenantSlug}/departements/${id}`, data),
  deleteDepartement: (tenantSlug: string, id: string) =>
    api.delete(`/t/${tenantSlug}/departements/${id}`),

  // SECTEURS
  createSecteur: (tenantSlug: string, data: any) =>
    api.post(`/t/${tenantSlug}/secteurs`, data),
  listSecteurs: (tenantSlug: string, query = {}) =>
    api.get(`/t/${tenantSlug}/secteurs`, { params: query }),
  updateSecteur: (tenantSlug: string, id: string, data: any) =>
    api.put(`/t/${tenantSlug}/secteurs/${id}`, data),
  deleteSecteur: (tenantSlug: string, id: string) =>
    api.delete(`/t/${tenantSlug}/secteurs/${id}`),

  // VILLAGES
  createVillage: (tenantSlug: string, data: any) =>
    api.post(`/t/${tenantSlug}/villages`, data),
  listVillages: (tenantSlug: string, query = {}) =>
    api.get(`/t/${tenantSlug}/villages`, { params: query }),
  updateVillage: (tenantSlug: string, id: string, data: any) =>
    api.put(`/t/${tenantSlug}/villages/${id}`, data),
  deleteVillage: (tenantSlug: string, id: string) =>
    api.delete(`/t/${tenantSlug}/villages/${id}`),
};

export default geoService;
