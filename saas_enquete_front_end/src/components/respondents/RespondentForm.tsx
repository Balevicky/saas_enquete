// src/components/respondents/RespondentForm.tsx
import { useState } from "react";

interface Props {
  onSubmit: (data: {
    name: string;
    firstname?: string;
    birthYear?: number;
  }) => void;
}

const RespondentForm = ({ onSubmit }: Props) => {
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [birthYear, setBirthYear] = useState<number | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, firstname, birthYear });
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 24 }}>
      <input
        placeholder="Firstname"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
      />
      <br />

      <input
        placeholder="Name"
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="Birth year"
        type="number"
        onChange={(e) => setBirthYear(Number(e.target.value))}
      />
      <br />

      <button type="submit">➕ Add respondent</button>
    </form>
  );
};

export default RespondentForm;

// ================================
// import { useState } from "react";
// import { respondentService } from "../../services/respondentService";

// interface Props {
//   tenantSlug: string;
//   surveyId: string;
//   onCreated?: () => void;
// }

// const RespondentForm = ({ tenantSlug, surveyId, onCreated }: Props) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await respondentService.create(tenantSlug, surveyId, { name, email });
//       setName("");
//       setEmail("");
//       onCreated?.();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
//       <input
//         type="text"
//         placeholder="Nom"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         required
//         style={{ marginRight: 8 }}
//       />
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//         style={{ marginRight: 8 }}
//       />
//       <button type="submit" disabled={loading}>
//         {loading ? "Ajout..." : "Ajouter"}
//       </button>
//     </form>
//   );
// };

// export default RespondentForm;

// ==============================================
// import React, { useState } from "react";

// interface Props {
//   onSubmit: (data: { name: string; email: string }) => void;
// }

// const RespondentForm = ({ onSubmit }: Props) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit({ name, email });
//     setName("");
//     setEmail("");
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
//       <input
//         type="text"
//         placeholder="Nom"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         required
//         style={{ marginRight: 8 }}
//       />
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//         style={{ marginRight: 8 }}
//       />
//       <button type="submit">Ajouter</button>
//     </form>
//   );
// };

// export default RespondentForm;
