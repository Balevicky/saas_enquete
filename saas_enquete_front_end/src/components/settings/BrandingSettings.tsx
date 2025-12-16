import { useEffect, useState } from "react";
import { TenantSettings } from "../../types/tenant";
import tenantSettingsApi from "../../services/tenantSettingsApi";
import { useTenantContext } from "../../contexts/TenantContext";

/**
 * 🔒 Type interne strict (aucune propriété optionnelle)
 */
type BrandingForm = {
  logoLight: string;
  logoDark: string;
  primaryColor: string;
  secondaryColor: string;
};

/**
 * Valeurs par défaut (source de vérité)
 */
const DEFAULT_BRANDING: BrandingForm = {
  logoLight: "",
  logoDark: "",
  primaryColor: "#000000",
  secondaryColor: "#000000",
};

const BrandingSettings = ({
  value,
  onChange,
}: {
  value?: any;
  onChange: (v: TenantSettings["branding"]) => void;
}) => {
  console.log("value.branding", value?.branding);

  const { tenantSlug } = useTenantContext();

  /**
   * État du formulaire (100% contrôlé)
   */
  const [form, setForm] = useState<BrandingForm>(DEFAULT_BRANDING);
  const [saving, setSaving] = useState(false);

  /**
   * 🔁 Synchronisation DB → formulaire
   */
  useEffect(() => {
    if (!value?.branding) return;

    setForm({
      ...DEFAULT_BRANDING,
      ...value.branding,
    });
  }, [value]);

  /**
   * Mise à jour générique
   */
  const update = <K extends keyof BrandingForm>(
    key: K,
    data: BrandingForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  /**
   * Sauvegarde API
   */
  const save = async () => {
    try {
      setSaving(true);
      const updated = await tenantSettingsApi.updateBranding(tenantSlug, form);
      onChange(updated);
      alert("Branding settings saved");
    } catch (err) {
      console.error("Failed to save branding settings", err);
      alert("Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Logos</h5>

        <input
          placeholder="Logo Light URL"
          value={form.logoLight}
          onChange={(e) => update("logoLight", e.target.value)}
          className="form-control mb-2"
        />

        <input
          placeholder="Logo Dark URL"
          value={form.logoDark}
          onChange={(e) => update("logoDark", e.target.value)}
          className="form-control mb-2"
        />
      </section>

      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Colors</h5>

        <input
          type="color"
          value={form.primaryColor}
          onChange={(e) => update("primaryColor", e.target.value)}
          className="form-control form-control-color mb-2"
        />

        <input
          type="color"
          value={form.secondaryColor}
          onChange={(e) => update("secondaryColor", e.target.value)}
          className="form-control form-control-color mb-2"
        />
      </section>

      <button onClick={save} className="btn btn-primary mt-2" disabled={saving}>
        {saving ? "Saving…" : "Save Branding"}
      </button>
    </div>
  );
};

export default BrandingSettings;

// =========================================
// import { useState } from "react";
// import { TenantSettings } from "../../types/tenant";
// import tenantSettingsApi from "../../services/tenantSettingsApi";
// import { useTenantContext } from "../../contexts/TenantContext";

// const BrandingSettings = ({
//   value,
//   onChange,
// }: {
//   // value?: TenantSettings["branding"];
//   value?: any;
//   onChange: (v: TenantSettings["branding"]) => void;
// }) => {
//   const { tenantSlug } = useTenantContext();
//   console.log("valueNBranding", value);

//   // On force form à toujours être un objet
//   const [form, setForm] = useState<NonNullable<TenantSettings["branding"]>>({
//     logoLight: "",
//     logoDark: "",
//     primaryColor: "#000000",
//     secondaryColor: "#000000",
//     ...value,
//   });
//   const [saving, setSaving] = useState(false);

//   // On utilise keyof NonNullable<> pour que TS accepte les clés
//   const update = <K extends keyof NonNullable<TenantSettings["branding"]>>(
//     key: K,
//     data: NonNullable<TenantSettings["branding"]>[K]
//   ) => {
//     setForm((f) => ({ ...f, [key]: data }));
//   };

//   const save = async () => {
//     try {
//       setSaving(true);
//       const updated = await tenantSettingsApi.updateBranding(tenantSlug, form);
//       onChange(updated);
//       alert("Branding settings saved");
//     } catch (err) {
//       console.error("Failed to save branding settings", err);
//       alert("Failed to save branding settings");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="mb-4">
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Logos</h5>
//         <input
//           placeholder="Logo Light URL"
//           value={form.logoLight}
//           onChange={(e) => update("logoLight", e.target.value)}
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Logo Dark URL"
//           value={form.logoDark}
//           onChange={(e) => update("logoDark", e.target.value)}
//           className="form-control mb-2"
//         />
//       </section>

//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Colors</h5>
//         <input
//           type="color"
//           value={form.primaryColor}
//           onChange={(e) => update("primaryColor", e.target.value)}
//           className="form-control form-control-color mb-2"
//         />
//         <input
//           type="color"
//           value={form.secondaryColor}
//           onChange={(e) => update("secondaryColor", e.target.value)}
//           className="form-control form-control-color mb-2"
//         />
//       </section>

//       <button onClick={save} className="btn btn-primary mt-2" disabled={saving}>
//         {saving ? "Saving…" : "Save Branding"}
//       </button>
//     </div>
//   );
// };

// export default BrandingSettings;

// =================================================
// import { useEffect, useState } from "react";
// import { TenantSettings } from "../../types/tenant";
// import tenantSettingsApi from "../../services/tenantSettingsApi";

// /**
//  * Props du composant BrandingSettings
//  */
// interface Props {
//   slug: string; // slug du tenant
//   value?: TenantSettings["branding"]; // branding actuel
//   onChange: (v: TenantSettings["branding"]) => void; // callback après sauvegarde
// }

// /**
//  * BrandingSettings ne doit jamais être undefined dans le state local
//  */
// type BrandingSettings = NonNullable<TenantSettings["branding"]>;

// /**
//  * Paramètres de branding du tenant
//  * (logos, couleurs, apparence)
//  */
// const BrandingSettings = ({ slug, value, onChange }: Props) => {
//   /**
//    * State local du formulaire
//    */
//   const [form, setForm] = useState<BrandingSettings>(value ?? {});

//   /**
//    * Synchronise le state local quand le parent change
//    */
//   useEffect(() => {
//     setForm(value ?? {});
//   }, [value]);

//   /**
//    * Sauvegarde du branding via l'API
//    */
//   const save = async () => {
//     try {
//       const updatedBranding = await tenantSettingsApi.updateBranding(
//         slug,
//         form
//       );

//       // Mise à jour du parent
//       onChange(updatedBranding);

//       alert("Branding settings saved");
//     } catch (error) {
//       console.error("Failed to save branding settings", error);
//       alert("Failed to save branding settings");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* ========================= */}
//       {/* Logos */}
//       {/* ========================= */}
//       <section>
//         <h2 className="font-semibold mb-2">Logos</h2>

//         <input
//           type="text"
//           placeholder="Logo light URL"
//           value={form.logoLight || ""}
//           onChange={(e) =>
//             setForm((prev) => ({
//               ...prev,
//               logoLight: e.target.value,
//             }))
//           }
//           className="border p-2 w-full rounded"
//         />

//         <input
//           type="text"
//           placeholder="Logo dark URL"
//           value={form.logoDark || ""}
//           onChange={(e) =>
//             setForm((prev) => ({
//               ...prev,
//               logoDark: e.target.value,
//             }))
//           }
//           className="border p-2 w-full rounded mt-2"
//         />
//       </section>

//       {/* ========================= */}
//       {/* Colors */}
//       {/* ========================= */}
//       <section>
//         <h2 className="font-semibold mb-2">Colors</h2>

//         <div className="flex gap-4">
//           <label className="flex flex-col">
//             <span className="text-sm">Primary color</span>
//             <input
//               type="color"
//               value={form.primaryColor || "#2563eb"}
//               onChange={(e) =>
//                 setForm((prev) => ({
//                   ...prev,
//                   primaryColor: e.target.value,
//                 }))
//               }
//             />
//           </label>

//           <label className="flex flex-col">
//             <span className="text-sm">Secondary color</span>
//             <input
//               type="color"
//               value={form.secondaryColor || "#ffffff"}
//               onChange={(e) =>
//                 setForm((prev) => ({
//                   ...prev,
//                   secondaryColor: e.target.value,
//                 }))
//               }
//             />
//           </label>
//         </div>
//       </section>

//       {/* ========================= */}
//       {/* Preview */}
//       {/* ========================= */}
//       <section>
//         <h2 className="font-semibold mb-2">Preview</h2>

//         <div
//           className="p-4 rounded text-white"
//           style={{ backgroundColor: form.primaryColor || "#2563eb" }}
//         >
//           {form.logoLight && (
//             <img src={form.logoLight} alt="Logo" className="h-8 mb-2" />
//           )}
//           <span>Brand preview</span>
//         </div>
//       </section>

//       {/* ========================= */}
//       {/* Save */}
//       {/* ========================= */}
//       <button
//         onClick={save}
//         className="bg-green-600 text-white px-4 py-2 rounded"
//       >
//         Save Branding
//       </button>
//     </div>
//   );
// };

// export default BrandingSettings;

// import { useState } from "react";
// import { TenantSettings } from "../../types/tenant";
// import { updateBrandingSettings } from "../../services/tenantSettingsApi";

// interface Props {
//   slug: string;
//   value?: TenantSettings["branding"];
//   onChange: (v: TenantSettings["branding"]) => void;
// }

// const BrandingSettings = ({ slug, value, onChange }: Props) => {
//   const [form, setForm] = useState<TenantSettings["branding"]>(value || {});

//   const save = async () => {
//     const updated = await updateBrandingSettings(slug, form);
//     onChange(updated);
//     alert("Branding saved");
//   };

//   return (
//     <div className="space-y-6">
//       <input
//         placeholder="Logo light URL"
//         value={form.logoLight || ""}
//         onChange={(e) => setForm({ ...form, logoLight: e.target.value })}
//         className="border p-2 w-full"
//       />

//       <input
//         type="color"
//         value={form.primaryColor || "#2563eb"}
//         onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
//       />

//       {/* Preview */}
//       <div
//         className="p-4 rounded text-white"
//         style={{ background: form.primaryColor }}
//       >
//         {form.logoLight && <img src={form.logoLight} className="h-8 mb-2" />}
//         <span>Brand preview</span>
//       </div>

//       <button
//         onClick={save}
//         className="bg-green-600 text-white px-4 py-2 rounded"
//       >
//         Save Branding
//       </button>
//     </div>
//   );
// };

// export default BrandingSettings;
