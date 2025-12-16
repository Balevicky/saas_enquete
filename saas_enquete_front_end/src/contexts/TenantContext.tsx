// src/contexts/TenantContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { TenantSettings } from "../types/tenant";
import tenantSettingsApi from "../services/tenantSettingsApi";
import { useTenant } from "../hooks/useTenant";

/**
 * Valeur exposée par le contexte Tenant
 */
interface TenantContextValue {
  tenantSlug: string;
  settings: TenantSettings;
  setSettings: React.Dispatch<React.SetStateAction<TenantSettings>>;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  /**
   * Slug tenant (useParams + fallback localStorage)
   */
  const { tenantSlug } = useTenant();

  /**
   * State global des settings
   */
  const [settings, setSettings] = useState<TenantSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Chargement initial des settings
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await tenantSettingsApi.getSettings(tenantSlug);
        console.log("data.general ", data.general?.organisation);

        setSettings(data);
      } catch (err) {
        console.error("Failed to load tenant settings", err);
        setError("Unable to load tenant settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [tenantSlug]);

  return (
    <TenantContext.Provider
      value={{
        tenantSlug,
        settings,
        setSettings,
        loading,
        error,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Hook sécurisé pour consommer le contexte Tenant
 */
export const useTenantContext = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return ctx;
};

// =============================
// src/contexts/TenantContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { TenantSettings } from "../types/tenant";
// import tenantSettingsApi from "../services/tenantSettingsApi";
// import { useParams } from "react-router-dom";

// // Définition du contexte
// interface TenantContextValue {
//   tenantSlug: string;
//   settings: TenantSettings;
//   setSettings: React.Dispatch<React.SetStateAction<TenantSettings>>;
//   loading: boolean;
//   error: string | null;
// }

// const TenantContext = createContext<TenantContextValue | undefined>(undefined);

// /**
//  * TenantProvider
//  *
//  * Objectifs :
//  * - Charger le tenant depuis slug (params > localStorage)
//  * - Fournir settings, loading, error et setter global
//  */
// export const TenantProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const params = useParams<{ slug: string }>();
//   const tenantSlug = params.slug || localStorage.getItem("tenantSlug") || "";

//   const [settings, setSettings] = useState<TenantSettings>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!tenantSlug) {
//       setError("Tenant slug is missing");
//       setLoading(false);
//       return;
//     }

//     const loadSettings = async () => {
//       try {
//         setLoading(true);
//         const data = await tenantSettingsApi.getSettings(tenantSlug);
//         setSettings(data);
//       } catch (err) {
//         console.error("Failed to load tenant settings", err);
//         setError("Failed to load tenant settings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();
//   }, [tenantSlug]);

//   return (
//     <TenantContext.Provider
//       value={{ tenantSlug, settings, setSettings, loading, error }}
//     >
//       {children}
//     </TenantContext.Provider>
//   );
// };

// /**
//  * Hook pour récupérer le tenant depuis le contexte
//  */
// export const useTenantContext = (): TenantContextValue => {
//   const context = useContext(TenantContext);
//   if (!context)
//     throw new Error("useTenantContext must be used within a TenantProvider");
//   return context;
// };
