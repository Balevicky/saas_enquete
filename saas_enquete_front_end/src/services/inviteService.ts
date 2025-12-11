import api from "../utils/api";

const inviteService = {
  createInvite: (tenantSlug: string, email: string) =>
    api.post(`/t/${tenantSlug}/invites`, { email }),
  listInvites: (tenantSlug: string) => api.get(`/t/${tenantSlug}/invites`),
  acceptInvite: (
    tenantSlug: string,
    token: string,
    password: string,
    fullName?: string
  ) =>
    api.post(`/t/${tenantSlug}/invites/accept`, { token, password, fullName }),
  revokeInvite: (tenantSlug: string, id: string) =>
    api.delete(`/t/${tenantSlug}/invites/${id}`),
};

export default inviteService;
