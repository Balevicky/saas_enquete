import { useEffect, useState } from "react";
import { TenantSettings } from "../../types/tenant";
import tenantSettingsApi from "../../services/tenantSettingsApi";
import { useTenantContext } from "../../contexts/TenantContext";

/**
 * 🔒 Type interne strict
 * → Plus aucune propriété optionnelle
 */
type GeneralForm = {
  organisation: {
    name: string;
    email: string;
    country: string;
    timezone: string;
    language: string;
  };
  users: {
    allowInvites: boolean;
    defaultRole: string;
    maxUsers: number;
  };
  emails: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    enabled: boolean;
  };
  security: {
    sessionDuration: number;
    passwordPolicy: string;
    twoFactorEnabled: boolean;
  };
};

/**
 * Valeurs par défaut (source de vérité)
 */
const DEFAULT_GENERAL: GeneralForm = {
  organisation: {
    name: "",
    email: "",
    country: "",
    timezone: "",
    language: "",
  },
  users: {
    allowInvites: false,
    defaultRole: "USER",
    maxUsers: 10,
  },
  emails: {
    fromName: "",
    fromEmail: "",
    replyTo: "",
    enabled: true,
  },
  security: {
    sessionDuration: 60,
    passwordPolicy: "",
    twoFactorEnabled: false,
  },
};
const GeneralSettings = ({
  value,
  onChange,
}: {
  value?: any;
  onChange: (v: TenantSettings["general"]) => void;
}) => {
  console.log("value.general", value.general);

  const { tenantSlug } = useTenantContext();

  const [form, setForm] = useState<GeneralForm>(DEFAULT_GENERAL);
  const [saving, setSaving] = useState(false);

  /**
   * 🔁 Synchronisation DB → formulaire
   */
  useEffect(() => {
    if (!value) return;

    setForm({
      organisation: {
        ...DEFAULT_GENERAL.organisation,
        ...value.general.organisation,
      },
      users: {
        ...DEFAULT_GENERAL.users,
        ...value.general.users,
      },
      emails: {
        ...DEFAULT_GENERAL.emails,
        ...value.general.emails,
      },
      security: {
        ...DEFAULT_GENERAL.security,
        ...value.general.security,
      },
    });
  }, [value]);

  const update = <K extends keyof GeneralForm>(
    key: K,
    data: GeneralForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const updated = await tenantSettingsApi.updateGeneral(tenantSlug, form);
      onChange(updated);
      alert("General settings saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save general settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      {/* Organisation */}
      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Organisation</h5>

        <input
          className="form-control mb-2"
          value={form.organisation.name}
          placeholder="Organisation Name"
          onChange={(e) =>
            update("organisation", {
              ...form.organisation,
              name: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.organisation.email}
          placeholder="Organisation Email"
          onChange={(e) =>
            update("organisation", {
              ...form.organisation,
              email: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.organisation.country}
          placeholder="Country"
          onChange={(e) =>
            update("organisation", {
              ...form.organisation,
              country: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.organisation.timezone}
          placeholder="Timezone"
          onChange={(e) =>
            update("organisation", {
              ...form.organisation,
              timezone: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.organisation.language}
          placeholder="Language"
          onChange={(e) =>
            update("organisation", {
              ...form.organisation,
              language: e.target.value,
            })
          }
        />
      </section>

      {/* Users */}
      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Users</h5>

        <label className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.users.allowInvites}
            onChange={(e) =>
              update("users", {
                ...form.users,
                allowInvites: e.target.checked,
              })
            }
          />
          <span className="form-check-label ms-2">Allow invitations</span>
        </label>

        <input
          type="number"
          className="form-control"
          value={form.users.maxUsers}
          onChange={(e) =>
            update("users", {
              ...form.users,
              maxUsers: Number(e.target.value),
            })
          }
        />
      </section>

      {/* Emails */}
      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Emails</h5>

        <input
          className="form-control mb-2"
          value={form.emails.fromName}
          placeholder="From Name"
          onChange={(e) =>
            update("emails", {
              ...form.emails,
              fromName: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.emails.fromEmail}
          placeholder="From Email"
          onChange={(e) =>
            update("emails", {
              ...form.emails,
              fromEmail: e.target.value,
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.emails.replyTo}
          placeholder="Reply To"
          onChange={(e) =>
            update("emails", {
              ...form.emails,
              replyTo: e.target.value,
            })
          }
        />

        <label className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.emails.enabled}
            onChange={(e) =>
              update("emails", {
                ...form.emails,
                enabled: e.target.checked,
              })
            }
          />
          <span className="form-check-label ms-2">Enable Emails</span>
        </label>
      </section>

      {/* Security */}
      <section className="mb-4">
        <h5 className="fw-semibold mb-2">Security</h5>

        <input
          type="number"
          className="form-control mb-2"
          value={form.security.sessionDuration}
          onChange={(e) =>
            update("security", {
              ...form.security,
              sessionDuration: Number(e.target.value),
            })
          }
        />

        <input
          className="form-control mb-2"
          value={form.security.passwordPolicy}
          placeholder="Password Policy"
          onChange={(e) =>
            update("security", {
              ...form.security,
              passwordPolicy: e.target.value,
            })
          }
        />

        <label className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.security.twoFactorEnabled}
            onChange={(e) =>
              update("security", {
                ...form.security,
                twoFactorEnabled: e.target.checked,
              })
            }
          />
          <span className="form-check-label ms-2">
            Two-factor authentication
          </span>
        </label>
      </section>

      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save General"}
      </button>
    </div>
  );
};

// const GeneralSettings = ({
//   value,
//   onChange,
// }: {
//   // value?: TenantSettings["general"];
//   // onChange: (v: TenantSettings["general"]) => void;
//   value?: TenantSettings["general"]; // 'value' peut être indéfini ou être un objet de type 'general'
//   onChange: (v: TenantSettings["general"]) => void;
// }) => {
//   console.log("value", value);

//   const { tenantSlug } = useTenantContext();

//   /**
//    * État du formulaire
//    * 👉 100% non optionnel
//    */
//   const [form, setForm] = useState<GeneralForm>(DEFAULT_GENERAL);
//   const [saving, setSaving] = useState(false);

//   /**
//    * 🔁 Synchronisation DB → formulaire
//    */
//   useEffect(() => {
//     if (!value) return;

//     // Vérifie si "value" est un objet contenant la propriété "general"
//     if ("general" in value) {
//       const general = value.general;

//       setForm({
//         organisation: {
//           ...DEFAULT_GENERAL.organisation,
//           ...general.organisation,
//         },
//         users: {
//           ...DEFAULT_GENERAL.users,
//           ...general.users,
//         },
//         emails: {
//           ...DEFAULT_GENERAL.emails,
//           ...general.emails,
//         },
//         security: {
//           ...DEFAULT_GENERAL.security,
//           ...general.security,
//         },
//       });
//     }
//   }, [value]);

//   // useEffect(() => {
//   //   if (!value) return;

//   //   // 🔥 NORMALISATION DU SHAPE
//   //   // Supporte :
//   //   // - value = general
//   //   // - value = { general }
//   //   const general = "general" in value && value.general ? value.general : value;

//   //   setForm({
//   //     organisation: {
//   //       ...DEFAULT_GENERAL.organisation,
//   //       ...general.organisation,
//   //     },
//   //     users: {
//   //       ...DEFAULT_GENERAL.users,
//   //       ...general.users,
//   //     },
//   //     emails: {
//   //       ...DEFAULT_GENERAL.emails,
//   //       ...general.emails,
//   //     },
//   //     security: {
//   //       ...DEFAULT_GENERAL.security,
//   //       ...general.security,
//   //     },
//   //   });
//   // }, [value]);

//   // useEffect(() => {
//   //   if (!value) return;

//   //   setForm({
//   //     organisation: {
//   //       ...DEFAULT_GENERAL.organisation,
//   //       ...value.organisation,
//   //     },
//   //     users: {
//   //       ...DEFAULT_GENERAL.users,
//   //       ...value.users,
//   //     },
//   //     emails: {
//   //       ...DEFAULT_GENERAL.emails,
//   //       ...value.emails,
//   //     },
//   //     security: {
//   //       ...DEFAULT_GENERAL.security,
//   //       ...value.security,
//   //     },
//   //   });
//   // }, [value]);

//   /**
//    * Mise à jour générique d’une section
//    */
//   const update = <K extends keyof GeneralForm>(
//     key: K,
//     data: GeneralForm[K]
//   ) => {
//     setForm((f) => ({ ...f, [key]: data }));
//   };

//   /**
//    * Sauvegarde API
//    */
//   const save = async () => {
//     try {
//       setSaving(true);
//       const updated = await tenantSettingsApi.updateGeneral(tenantSlug, form);
//       onChange(updated);
//       alert("General settings saved");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save general settings");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="mb-4">
//       {/* Organisation */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Organisation</h5>
//         <input
//           className="form-control mb-2"
//           placeholder="Organisation Name"
//           value={form.organisation.name}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               name: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Organisation Email"
//           value={form.organisation.email}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               email: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Country"
//           value={form.organisation.country}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               country: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Timezone"
//           value={form.organisation.timezone}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               timezone: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Language"
//           value={form.organisation.language}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               language: e.target.value,
//             })
//           }
//         />
//       </section>

//       {/* Users */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Users</h5>
//         <label className="form-check mb-2">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.users.allowInvites}
//             onChange={(e) =>
//               update("users", {
//                 ...form.users,
//                 allowInvites: e.target.checked,
//               })
//             }
//           />
//           <span className="form-check-label ms-2">Allow invitations</span>
//         </label>
//         <input
//           type="number"
//           className="form-control mb-2"
//           placeholder="Max users"
//           value={form.users.maxUsers}
//           onChange={(e) =>
//             update("users", {
//               ...form.users,
//               maxUsers: Number(e.target.value),
//             })
//           }
//         />
//       </section>

//       {/* Emails */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Emails</h5>
//         <input
//           className="form-control mb-2"
//           placeholder="From Name"
//           value={form.emails.fromName}
//           onChange={(e) =>
//             update("emails", {
//               ...form.emails,
//               fromName: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="From Email"
//           value={form.emails.fromEmail}
//           onChange={(e) =>
//             update("emails", {
//               ...form.emails,
//               fromEmail: e.target.value,
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Reply To"
//           value={form.emails.replyTo}
//           onChange={(e) =>
//             update("emails", {
//               ...form.emails,
//               replyTo: e.target.value,
//             })
//           }
//         />
//         <label className="form-check">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.emails.enabled}
//             onChange={(e) =>
//               update("emails", {
//                 ...form.emails,
//                 enabled: e.target.checked,
//               })
//             }
//           />
//           <span className="form-check-label ms-2">Enable Emails</span>
//         </label>
//       </section>

//       {/* Security */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Security</h5>
//         <input
//           type="number"
//           className="form-control mb-2"
//           placeholder="Session duration (minutes)"
//           value={form.security.sessionDuration}
//           onChange={(e) =>
//             update("security", {
//               ...form.security,
//               sessionDuration: Number(e.target.value),
//             })
//           }
//         />
//         <input
//           className="form-control mb-2"
//           placeholder="Password Policy"
//           value={form.security.passwordPolicy}
//           onChange={(e) =>
//             update("security", {
//               ...form.security,
//               passwordPolicy: e.target.value,
//             })
//           }
//         />
//         <label className="form-check">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.security.twoFactorEnabled}
//             onChange={(e) =>
//               update("security", {
//                 ...form.security,
//                 twoFactorEnabled: e.target.checked,
//               })
//             }
//           />
//           <span className="form-check-label ms-2">Two Factor Enabled</span>
//         </label>
//       </section>

//       <button onClick={save} className="btn btn-primary mt-2" disabled={saving}>
//         {saving ? "Saving…" : "Save General"}
//       </button>
//     </div>
//   );
// };

export default GeneralSettings;

// ====================================
// import { useState } from "react";
// import { TenantSettings } from "../../types/tenant";
// import tenantSettingsApi from "../../services/tenantSettingsApi";
// import { useTenantContext } from "../../contexts/TenantContext";

// /**
//  * Composant pour gérer les paramètres "General" du tenant
//  * Récupère le tenantSlug depuis le contexte
//  */
// const GeneralSettings = ({
//   value,
//   onChange,
// }: {
//   value?: TenantSettings["general"];
//   onChange: (v: TenantSettings["general"]) => void;
// }) => {
//   const { tenantSlug } = useTenantContext();

//   // Forcer un objet par défaut pour éviter undefined
//   const [form, setForm] = useState<NonNullable<TenantSettings["general"]>>({
//     organisation: {
//       name: "",
//       email: "",
//       country: "",
//       timezone: "",
//       language: "",
//     },
//     users: {
//       allowInvites: false,
//       defaultRole: "USER",
//       maxUsers: 10,
//     },
//     emails: {
//       fromName: "",
//       fromEmail: "",
//       replyTo: "",
//       enabled: true,
//     },
//     security: {
//       sessionDuration: 60,
//       passwordPolicy: "",
//       twoFactorEnabled: false,
//     },
//     ...value,
//   });

//   const [saving, setSaving] = useState(false);

//   // Fonction générique pour mettre à jour une section
//   const update = <K extends keyof NonNullable<TenantSettings["general"]>>(
//     key: K,
//     data: NonNullable<TenantSettings["general"]>[K]
//   ) => {
//     setForm((f) => ({ ...f, [key]: data }));
//   };

//   // Sauvegarde via l'API
//   const save = async () => {
//     try {
//       setSaving(true);
//       const updated = await tenantSettingsApi.updateGeneral(tenantSlug, form);
//       onChange(updated);
//       alert("General settings saved");
//     } catch (err) {
//       console.error("Failed to save general settings", err);
//       alert("Failed to save general settings");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="mb-4">
//       {/* Organisation */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Organisation</h5>
//         <input
//           placeholder="Organisation Name"
//           value={form.organisation?.name}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               name: e.target.value,
//             })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Organisation Email"
//           value={form.organisation?.email}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               email: e.target.value,
//             })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Country"
//           value={form.organisation?.country}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               country: e.target.value,
//             })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Timezone"
//           value={form.organisation?.timezone}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               timezone: e.target.value,
//             })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Language"
//           value={form.organisation?.language}
//           onChange={(e) =>
//             update("organisation", {
//               ...form.organisation,
//               language: e.target.value,
//             })
//           }
//           className="form-control mb-2"
//         />
//       </section>

//       {/* Users */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Users</h5>
//         <label className="form-check mb-2">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.users?.allowInvites}
//             onChange={(e) =>
//               update("users", { ...form.users, allowInvites: e.target.checked })
//             }
//           />
//           <span className="form-check-label ms-2">Allow invitations</span>
//         </label>
//         <input
//           type="number"
//           className="form-control mb-2"
//           placeholder="Max users"
//           value={form.users?.maxUsers}
//           onChange={(e) =>
//             update("users", { ...form.users, maxUsers: Number(e.target.value) })
//           }
//         />
//       </section>

//       {/* Emails */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Emails</h5>
//         <input
//           placeholder="From Name"
//           value={form.emails?.fromName}
//           onChange={(e) =>
//             update("emails", { ...form.emails, fromName: e.target.value })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="From Email"
//           value={form.emails?.fromEmail}
//           onChange={(e) =>
//             update("emails", { ...form.emails, fromEmail: e.target.value })
//           }
//           className="form-control mb-2"
//         />
//         <input
//           placeholder="Reply To"
//           value={form.emails?.replyTo}
//           onChange={(e) =>
//             update("emails", { ...form.emails, replyTo: e.target.value })
//           }
//           className="form-control mb-2"
//         />
//         <label className="form-check">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.emails?.enabled}
//             onChange={(e) =>
//               update("emails", { ...form.emails, enabled: e.target.checked })
//             }
//           />
//           <span className="form-check-label ms-2">Enable Emails</span>
//         </label>
//       </section>

//       {/* Security */}
//       <section className="mb-4">
//         <h5 className="fw-semibold mb-2">Security</h5>
//         <input
//           type="number"
//           placeholder="Session duration (minutes)"
//           className="form-control mb-2"
//           value={form.security?.sessionDuration}
//           onChange={(e) =>
//             update("security", {
//               ...form.security,
//               sessionDuration: Number(e.target.value),
//             })
//           }
//         />
//         <input
//           placeholder="Password Policy"
//           className="form-control mb-2"
//           value={form.security?.passwordPolicy}
//           onChange={(e) =>
//             update("security", {
//               ...form.security,
//               passwordPolicy: e.target.value,
//             })
//           }
//         />
//         <label className="form-check">
//           <input
//             type="checkbox"
//             className="form-check-input"
//             checked={form.security?.twoFactorEnabled}
//             onChange={(e) =>
//               update("security", {
//                 ...form.security,
//                 twoFactorEnabled: e.target.checked,
//               })
//             }
//           />
//           <span className="form-check-label ms-2">Two Factor Enabled</span>
//         </label>
//       </section>

//       {/* Save button */}
//       <button onClick={save} className="btn btn-primary mt-2" disabled={saving}>
//         {saving ? "Saving…" : "Save General"}
//       </button>
//     </div>
//   );
// };

// export default GeneralSettings;

// =============================
// import { useEffect, useState } from "react";
// import { TenantSettings } from "../../types/tenant";
// import tenantSettingsApi from "../../services/tenantSettingsApi";

// /**
//  * Props du composant
//  */
// interface Props {
//   slug: string;
//   value?: TenantSettings["general"];
//   onChange: (v: TenantSettings["general"]) => void;
// }

// type GeneralSettings = NonNullable<TenantSettings["general"]>;

// /**
//  * Paramètres généraux du tenant
//  */
// const GeneralSettings = ({ slug, value, onChange }: Props) => {
//   const [form, setForm] = useState<GeneralSettings>(value ?? {});

//   /**
//    * Sync props -> state
//    */
//   useEffect(() => {
//     setForm(value ?? {});
//   }, [value]);

//   /**
//    * Mise à jour d'une section (organisation, users, etc.)
//    */
//   const updateSection = <K extends keyof GeneralSettings>(
//     key: K,
//     data: GeneralSettings[K]
//   ) => {
//     setForm((prev) => ({
//       ...prev,
//       [key]: data,
//     }));
//   };

//   /**
//    * Sauvegarde via API
//    */
//   const save = async () => {
//     try {
//       const updated = await tenantSettingsApi.updateGeneral(slug, form);
//       onChange(updated);
//       alert("General settings saved");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save general settings");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Organisation */}
//       <section>
//         <h2 className="font-semibold mb-2">Organisation</h2>

//         <input
//           type="text"
//           placeholder="Organisation name"
//           value={form.organisation?.name || ""}
//           onChange={(e) =>
//             updateSection("organisation", {
//               ...form.organisation,
//               name: e.target.value,
//             })
//           }
//           className="border p-2 w-full rounded"
//         />
//       </section>

//       {/* Users */}
//       <section>
//         <h2 className="font-semibold mb-2">Users</h2>

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={form.users?.allowInvites ?? false}
//             onChange={(e) =>
//               updateSection("users", {
//                 ...form.users,
//                 allowInvites: e.target.checked,
//               })
//             }
//           />
//           Allow invitations
//         </label>
//       </section>

//       <button
//         onClick={save}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Save General
//       </button>
//     </div>
//   );
// };

// export default GeneralSettings;
