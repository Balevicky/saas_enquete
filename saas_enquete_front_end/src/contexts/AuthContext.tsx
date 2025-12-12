// ==================================================
// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useEffect,
// } from "react";
// import authService from "../services/authService";
// import { useNavigate, useParams } from "react-router-dom";

// // 🔹 Structure des données fournies par le contexte d’authentification
// type AuthContextType = {
//   token: string | null;
//   user: any | null;
//   tenantSlug: string | null;
//   setTenantSlug: (slug: string) => void; // 🔹 setter pour workspace switcher
//   login: (email: string, password: string, slug: string) => Promise<void>;
//   logout: () => void;
// };

// // 🔹 Création du contexte
// const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const navigate = useNavigate();
//   const params = useParams<{ tenantSlug: string }>();

//   const urlSlug = params.tenantSlug || null;
//   const storedSlug = localStorage.getItem("tenantSlug");
//   const [tenantSlug, setTenantSlugState] = useState<string | null>(
//     urlSlug || storedSlug || null
//   );

//   const [token, setToken] = useState<string | null>(
//     localStorage.getItem("token")
//   );
//   const [user, setUser] = useState<any | null>(null);

//   const setTenantSlug = (slug: string) => {
//     setTenantSlugState(slug);
//     localStorage.setItem("tenantSlug", slug);
//   };

//   useEffect(() => {
//     if (token) setUser(null);
//   }, [token]);

//   const login = async (email: string, password: string, slug: string) => {
//     const effectiveSlug = tenantSlug || slug;
//     if (!effectiveSlug) throw new Error("Tenant missing");

//     const res = await authService.login(effectiveSlug, email, password);

//     localStorage.setItem("token", res.token);
//     setToken(res.token);

//     setUser(res.user);
//     setTenantSlug(effectiveSlug);

//     navigate(`/t/${effectiveSlug}/dashboard`);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("tenantSlug");

//     setToken(null);
//     setUser(null);
//     setTenantSlugState(null);

//     navigate("/login");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ token, user, tenantSlug, setTenantSlug, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// export default AuthContext;

// =====================================
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";

type AuthContextType = {
  token: string | null;
  user: any | null;
  tenantSlug: string | null;
  login: (email: string, password: string, slug: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { tenantSlug: urlSlug } = useParams<{ tenantSlug: string }>();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any | null>(null);

  /**
   * Détection propre du tenantSlug :
   * - Priorité à : /t/:tenantSlug/...
   * - Sinon : stockage local
   */
  const [tenantSlug, setTenantSlug] = useState<string | null>(() => {
    return urlSlug || localStorage.getItem("tenantSlug") || null;
  });

  useEffect(() => {
    if (urlSlug && urlSlug !== tenantSlug) {
      // Si l’URL change, mettre à jour le slug global
      setTenantSlug(urlSlug);
      localStorage.setItem("tenantSlug", urlSlug);
    }
  }, [urlSlug]);

  /**
   * LOGIN MULTI-TENANT
   * slug → prioritaire (fournit par Login.tsx)
   */
  const login = async (email: string, password: string, slug: string) => {
    if (!slug) throw new Error("Tenant slug is required");

    // Appel backend
    const res = await authService.login(slug, email, password);

    // Sauvegarde persistante
    localStorage.setItem("token", res.token);
    localStorage.setItem("tenantSlug", slug);

    setToken(res.token);
    setUser(res.user);
    setTenantSlug(slug);

    navigate(`/t/${slug}/dashboard`);
  };

  /** LOGOUT **/
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantSlug");

    setToken(null);
    setUser(null);
    setTenantSlug(null);

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

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
