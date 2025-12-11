import axios from "../utils/api";

const authService = {
  /**
   * Login utilisateur pour un tenant spécifique
   * @param tenantSlug - slug du tenant depuis l'URL front-end
   * @param email - email de l'utilisateur
   * @param password - mot de passe
   */
  login: async (tenantSlug: string, email: string, password: string) => {
    console.log(email, password);

    // L'URL inclut le slug du tenant : /t/:tenantSlug/auth/login
    const res = await axios.post(`/t/${tenantSlug}/auth/login`, {
      email,
      password,
    });
    // On stocke le token JWT dans le localStorage
    localStorage.setItem("token", res.data.token);
    return res.data;
  },

  /**
   * Inscription utilisateur pour un tenant spécifique
   * @param tenantSlug - slug du tenant
   * @param data - données utilisateur (email, password, fullName, ...)
   */
  register: async (tenantSlug: string, data: any) => {
    const res = await axios.post(`/t/${tenantSlug}/auth/register`, data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  },

  /**
   * Création d'un nouveau tenant depuis le front-end
   * Note : ici, pas besoin de tenantSlug préalable, car c'est la création initiale
   * @param data - informations tenant + owner (tenantName, tenantSlug, ownerEmail, ownerPassword)
   */
  signupTenant: async (data: any) => {
    const res = await axios.post("/auth/signup", data); // pas de slug encore
    console.log(res);

    localStorage.setItem("token", res.data.token);
    // localStorage.setItem("slug", res.data.tenant.slug);
    localStorage.setItem("tenantSlug", res.data.tenant.slug);
    return res.data;
  },
};

export default authService;
