import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import authService from "../services/authService";
import { useNavigate, useParams } from "react-router-dom";

// 🔹 Structure des données fournies par le contexte d’authentification
type AuthContextType = {
  token: string | null; // JWT stocké après login / signup
  user: any | null; // Informations sur l'utilisateur connecté
  tenantSlug: string | null; // Slug du tenant actuel
  login: (email: string, password: string) => Promise<void>; // fonction login
  logout: () => void; // fonction logout
};

// 🔹 On crée un contexte vide à la base
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 🔹 Ce provider englobe toute l'application (dans App.tsx)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // On récupère le paramètre tenantSlug dans l'URL si présent
  const params = useParams<{ tenantSlug?: string }>();

  /**
   * 🎯 Gestion intelligente du tenantSlug :
   *
   * 1️⃣ Priorité à l'URL : /t/:tenantSlug/...
   * 2️⃣ Sinon : récupérer le slug stocké dans localStorage
   *     (nécessaire juste après le signup)
   * 3️⃣ Sinon : tenantSlug = null (cas page /signup)
   */

  const urlSlug = params.tenantSlug || null;
  const storedSlug = localStorage.getItem("tenantSlug");
  console.log("storedSlug", storedSlug);
  console.log("urlSlug", urlSlug);

  const tenantSlug = urlSlug || storedSlug || null;
  console.log("tenanSlug", tenantSlug);

  // 🔹 Token JWT initialisé depuis localStorage (persistant)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // 🔹 Infos utilisateur
  const [user, setUser] = useState<any | null>(null);

  /**
   * 🧠 Quand le token change, on peut recharger le profil utilisateur.
   * Pour l'instant tu mets user à null (à remplacer par un fetch du profil si besoin)
   */
  useEffect(() => {
    if (token) {
      setUser(null);
    }
  }, [token]);

  /**
   * 🔐 Fonction LOGIN multi-tenant
   *
   * - Vérifie que le tenantSlug existe (URL ou localStorage)
   * - Envoie la requête au backend
   * - Sauvegarde token + slug
   * - Redirige vers dashboard
   */
  const login = async (email: string, password: string) => {
    // Si aucun tenant n'a pu être déterminé → erreur
    console.log("tenanSlug dans login", tenantSlug);
    if (!tenantSlug) throw new Error("Tenant missing in URL or storage");

    // Appel API vers /t/:tenantSlug/auth/login
    const res = await authService.login(tenantSlug, email, password);

    // Sauvegarde du token et du slug pour usage futur
    localStorage.setItem("token", res.token);
    localStorage.setItem("tenantSlug", tenantSlug);

    // Mise à jour du state React
    setToken(res.token);
    setUser(res.user);

    // Redirection après login
    navigate(`/t/${tenantSlug}/dashboard`);
  };

  /**
   * 🚪 Fonction LOGOUT
   *
   * - Supprime token + slug du localStorage
   * - Réinitialise l'état local
   * - Redirige vers /login
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantSlug");

    setToken(null);
    setUser(null);

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tenantSlug,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook personnalisé pour importer facilement le contexte dans le reste du front
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
