import { useState } from "react";
import GeneralSettings from "../components/settings/GeneralSettings";
import BrandingSettings from "../components/settings/BrandingSettings";
import { useTenantContext } from "../contexts/TenantContext";

const SettingsPage: React.FC = () => {
  const { tenantSlug, settings, setSettings, loading, error } =
    useTenantContext();
  console.log("settings.general", settings.general);

  const [tab, setTab] = useState<"general" | "branding">("general");

  if (loading) return <div className="p-4">Loading settings…</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;
  console.log("{settings.general}", { settings });
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Tenant Settings</h3>
          <div className="d-flex gap-3 border-bottom">
            <button
              type="button"
              className={`btn btn-link px-0 pb-2 fw-semibold ${
                tab === "general"
                  ? "text-primary border-bottom border-2"
                  : "text-muted"
              }`}
              onClick={() => setTab("general")}
            >
              General
            </button>
            <button
              type="button"
              className={`btn btn-link px-0 pb-2 fw-semibold ${
                tab === "branding"
                  ? "text-primary border-bottom border-2"
                  : "text-muted"
              }`}
              onClick={() => setTab("branding")}
            >
              Branding
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card shadow-sm">
        <div className="card-body">
          {tab === "general" && (
            <GeneralSettings
              // slug={tenantSlug}
              value={settings.general}
              onChange={(general) =>
                setSettings((prev) => ({ ...prev, general }))
              }
            />
          )}
          {tab === "branding" && (
            <BrandingSettings
              // slug={tenantSlug}
              value={settings.branding}
              onChange={(branding) =>
                setSettings((prev) => ({ ...prev, branding }))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

// ==============================================
// import { useEffect, useState } from "react";
// import { TenantSettings } from "../types/tenant";
// // import { getTenantSettings } from "../services/tenantSettingsApi";
// // import getTenantSettings from "../services/tenantSettingsApi";
// import tenantSettingsApi from "../services/tenantSettingsApi";
// import GeneralSettings from "../components/settings/GeneralSettings";
// import BrandingSettings from "../components/settings/BrandingSettings";

// /**
//  * Page Settings du tenant
//  *
//  * Objectifs :
//  * - Afficher et modifier les paramètres du tenant
//  * - Fournir une UX cohérente avec InviteList (Bootstrap cards)
//  * - Séparer clairement General / Branding
//  */
// const SettingsPage = () => {
//   /**
//    * Slug du tenant
//    * 👉 À terme : récupéré via react-router (useParams)
//    */
//   const tenantSlug = "my-tenant";

//   /**
//    * État global des settings
//    */
//   const [settings, setSettings] = useState<TenantSettings>({});

//   /**
//    * Onglet actif
//    */
//   const [tab, setTab] = useState<"general" | "branding">("general");

//   /**
//    * Chargement initial des settings
//    */
//   // useEffect(() => {
//   //   getTenantSettings(tenantSlug).then(setSettings);
//   // }, [tenantSlug]);
//   useEffect(() => {
//     tenantSettingsApi.getSettings(tenantSlug).then(setSettings);
//   }, [tenantSlug]);
//   return (
//     // <div className="p-3">
//     <div className="container mt-4">
//       {/* ============================= */}
//       {/* HEADER CARD */}
//       {/* ============================= */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <h3 className="mb-3 fw-semibold">Tenant Settings</h3>

//           {/* Tabs */}
//           <div className="d-flex gap-3 border-bottom">
//             <button
//               type="button"
//               className={`btn btn-link px-0 pb-2 fw-semibold ${
//                 tab === "general"
//                   ? "text-primary border-bottom border-2"
//                   : "text-muted"
//               }`}
//               onClick={() => setTab("general")}
//             >
//               General
//             </button>

//             <button
//               type="button"
//               className={`btn btn-link px-0 pb-2 fw-semibold ${
//                 tab === "branding"
//                   ? "text-primary border-bottom border-2"
//                   : "text-muted"
//               }`}
//               onClick={() => setTab("branding")}
//             >
//               Branding
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ============================= */}
//       {/* CONTENT CARD */}
//       {/* ============================= */}
//       <div className="card shadow-sm">
//         <div className="card-body">
//           {tab === "general" && (
//             <GeneralSettings
//               slug={tenantSlug}
//               value={settings.general}
//               /**
//                * Mise à jour locale après sauvegarde
//                * (l’appel API est géré dans le composant enfant)
//                */
//               onChange={(general) =>
//                 setSettings((prev) => ({
//                   ...prev,
//                   general,
//                 }))
//               }
//             />
//           )}

//           {tab === "branding" && (
//             <BrandingSettings
//               slug={tenantSlug}
//               value={settings.branding}
//               /**
//                * Mise à jour locale après sauvegarde
//                */
//               onChange={(branding) =>
//                 setSettings((prev) => ({
//                   ...prev,
//                   branding,
//                 }))
//               }
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;

// ===========================================
// import { useEffect, useState } from "react";
// import { TenantSettings } from "../types/tenant";
// import tenantSettingsApi from "../services/tenantSettingsApi";

// import GeneralSettings from "../components/settings/GeneralSettings";
// import BrandingSettings from "../components/settings/BrandingSettings";

// /**
//  * Page principale des paramètres du tenant
//  *
//  * Responsabilités :
//  * - Charger les settings depuis l'API
//  * - Gérer les onglets (General / Branding)
//  * - Centraliser l'état global des settings
//  */
// const SettingsPage = () => {
//   /**
//    * Slug du tenant
//    * Stocké dans le localStorage lors du login / switch tenant
//    */
//   const [tenantSlug, setTenantSlug] = useState<string | null>(null);

//   /**
//    * État global des settings du tenant
//    */
//   const [settings, setSettings] = useState<TenantSettings>({});

//   /**
//    * Onglet actif
//    */
//   const [tab, setTab] = useState<"general" | "branding">("general");

//   /**
//    * États UX
//    */
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /**
//    * Lecture du tenantSlug au montage
//    */
//   useEffect(() => {
//     const slug = localStorage.getItem("tenantSlug");

//     if (!slug) {
//       setError("Tenant not selected");
//       setLoading(false);
//       return;
//     }

//     setTenantSlug(slug);
//   }, []);

//   /**
//    * Chargement des settings dès que le tenantSlug est connu
//    */
//   useEffect(() => {
//     if (!tenantSlug) return;

//     const loadSettings = async () => {
//       try {
//         setLoading(true);
//         const data = await tenantSettingsApi.getSettings(tenantSlug);
//         setSettings(data);
//       } catch (err) {
//         console.error("Failed to load tenant settings", err);
//         setError("Unable to load settings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();
//   }, [tenantSlug]);

//   /**
//    * États intermédiaires
//    */
//   if (loading) {
//     return <div className="p-6">Loading settings...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-600">{error}</div>;
//   }

//   /**
//    * Sécurité supplémentaire
//    * (TypeScript sait maintenant que tenantSlug est string)
//    */
//   if (!tenantSlug) {
//     return null;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       {/* ========================= */}
//       {/* Title */}
//       {/* ========================= */}
//       <h1 className="text-2xl font-bold mb-6">Settings</h1>

//       {/* ========================= */}
//       {/* Tabs */}
//       {/* ========================= */}
//       <div className="flex gap-6 border-b mb-6">
//         <button
//           className={`pb-2 ${
//             tab === "general"
//               ? "font-bold border-b-2 border-blue-600"
//               : "text-gray-500"
//           }`}
//           onClick={() => setTab("general")}
//         >
//           General
//         </button>

//         <button
//           className={`pb-2 ${
//             tab === "branding"
//               ? "font-bold border-b-2 border-blue-600"
//               : "text-gray-500"
//           }`}
//           onClick={() => setTab("branding")}
//         >
//           Branding
//         </button>
//       </div>

//       {/* ========================= */}
//       {/* Content */}
//       {/* ========================= */}
//       {tab === "general" && (
//         <GeneralSettings
//           slug={tenantSlug}
//           value={settings.general}
//           /**
//            * Mise à jour locale après sauvegarde réussie
//            */
//           onChange={(general) =>
//             setSettings((prev) => ({
//               ...prev,
//               general,
//             }))
//           }
//         />
//       )}

//       {tab === "branding" && (
//         <BrandingSettings
//           slug={tenantSlug}
//           value={settings.branding}
//           /**
//            * Mise à jour locale après sauvegarde réussie
//            */
//           onChange={(branding) =>
//             setSettings((prev) => ({
//               ...prev,
//               branding,
//             }))
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default SettingsPage;

// ===========================================================

// import { useEffect, useState } from "react";
// import { TenantSettings } from "../types/tenant";
// import tenantSettingsApi from "../services/tenantSettingsApi";

// import GeneralSettings from "../components/settings/GeneralSettings";
// import BrandingSettings from "../components/settings/BrandingSettings";

// /**
//  * Page principale des paramètres du tenant
//  *
//  * Responsabilités :
//  * - Charger les settings depuis l'API
//  * - Gérer les onglets (General / Branding)
//  * - Centraliser l'état global des settings
//  */
// const SettingsPage = () => {
//   /**
//    * Slug du tenant
//    * 👉 À terme : useParams() depuis react-router
//    */
//   //   const tenantSlug = "my-tenant";
//   const tenantSlug = localStorage.getItem("tenantSlug");
//   /**
//    * État global des settings du tenant
//    * Contient :
//    * - general
//    * - branding
//    */
//   const [settings, setSettings] = useState<TenantSettings>({});

//   /**
//    * Onglet actif
//    */
//   const [tab, setTab] = useState<"general" | "branding">("general");

//   /**
//    * États UX
//    */
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /**
//    * Chargement initial des settings
//    */
//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         setLoading(true);
//         const data = await tenantSettingsApi.getSettings(tenantSlug);
//         setSettings(data);
//       } catch (err) {
//         console.error("Failed to load tenant settings", err);
//         setError("Unable to load settings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();
//   }, [tenantSlug]);

//   /**
//    * États intermédiaires
//    */
//   if (loading) {
//     return <div className="p-6">Loading settings...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-600">{error}</div>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       {/* ========================= */}
//       {/* Title */}
//       {/* ========================= */}
//       <h1 className="text-2xl font-bold mb-6">Settings</h1>

//       {/* ========================= */}
//       {/* Tabs */}
//       {/* ========================= */}
//       <div className="flex gap-6 border-b mb-6">
//         <button
//           className={`pb-2 ${
//             tab === "general"
//               ? "font-bold border-b-2 border-blue-600"
//               : "text-gray-500"
//           }`}
//           onClick={() => setTab("general")}
//         >
//           General
//         </button>

//         <button
//           className={`pb-2 ${
//             tab === "branding"
//               ? "font-bold border-b-2 border-blue-600"
//               : "text-gray-500"
//           }`}
//           onClick={() => setTab("branding")}
//         >
//           Branding
//         </button>
//       </div>

//       {/* ========================= */}
//       {/* Content */}
//       {/* ========================= */}
//       {tab === "general" && (
//         <GeneralSettings
//           slug={tenantSlug}
//           value={settings.general}
//           /**
//            * Mise à jour locale après sauvegarde réussie
//            * (la sauvegarde API est faite dans le composant enfant)
//            */
//           onChange={(general) =>
//             setSettings((prev) => ({
//               ...prev,
//               general,
//             }))
//           }
//         />
//       )}

//       {tab === "branding" && (
//         <BrandingSettings
//           slug={tenantSlug}
//           value={settings.branding}
//           /**
//            * Mise à jour locale après sauvegarde réussie
//            */
//           onChange={(branding) =>
//             setSettings((prev) => ({
//               ...prev,
//               branding,
//             }))
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default SettingsPage;

// ======================================
// import { useEffect, useState } from "react";
// import { TenantSettings } from "../types/tenant";
// import { getTenantSettings } from "../services/tenantSettingsApi";
// import GeneralSettings from "../components/settings/GeneralSettings";
// import BrandingSettings from "../components/settings/BrandingSettings";

// const SettingsPage = () => {
//   const tenantSlug = "my-tenant"; // depuis le router
//   const [settings, setSettings] = useState<TenantSettings>({});
//   const [tab, setTab] = useState<"general" | "branding">("general");

//   useEffect(() => {
//     getTenantSettings(tenantSlug).then(setSettings);
//   }, []);

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Settings</h1>

//       {/* Tabs */}
//       <div className="flex gap-4 border-b mb-6">
//         <button
//           className={tab === "general" ? "font-bold" : ""}
//           onClick={() => setTab("general")}
//         >
//           General
//         </button>
//         <button
//           className={tab === "branding" ? "font-bold" : ""}
//           onClick={() => setTab("branding")}
//         >
//           Branding
//         </button>
//       </div>

//       {tab === "general" && (
//         <GeneralSettings
//           slug={tenantSlug}
//           value={settings.general}
//           onChange={(general) => setSettings((s) => ({ ...s, general }))}
//         />
//       )}

//       {tab === "branding" && (
//         <BrandingSettings
//           slug={tenantSlug}
//           value={settings.branding}
//           onChange={(branding) => setSettings((s) => ({ ...s, branding }))}
//         />
//       )}
//     </div>
//   );
// };

// export default SettingsPage;
