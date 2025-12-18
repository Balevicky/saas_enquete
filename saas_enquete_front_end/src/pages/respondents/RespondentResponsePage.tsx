// src/pages/respondents/RespondentResponsePage.tsx

import { useParams } from "react-router-dom";

const RespondentResponsePage = () => {
  const { respondentId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>Responses of respondent {respondentId}</h2>
      {/* Les réponses sont déjà incluses dans GET /respondents/:id */}
    </div>
  );
};

export default RespondentResponsePage;
// =======================================
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import respondentResponseService, {
//   RespondentAnswer,
// } from "../../services/respondentResponseService";
// import { Respondent } from "../../services/respondentService";
// import RespondentStatusBadge from "../../components/respondents/RespondentStatusBadge";

// const RespondentResponsePage = () => {
//   const { tenantSlug, respondentId } = useParams<{
//     tenantSlug: string;
//     respondentId: string;
//   }>();

//   const [respondent, setRespondent] = useState<Respondent | null>(null);
//   const [responses, setResponses] = useState<RespondentAnswer[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!tenantSlug || !respondentId) return;

//     setLoading(true);
//     respondentResponseService
//       .getResponses(tenantSlug, respondentId)
//       .then((data) => {
//         setRespondent(data.respondent);
//         setResponses(data.responses);
//       })
//       .finally(() => setLoading(false));
//   }, [tenantSlug, respondentId]);

//   if (loading) return <p>Chargement des réponses...</p>;
//   if (!respondent) return <p>Participant introuvable.</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <Link to=".." relative="path">
//         ◀ Retour
//       </Link>

//       {/* 🧍 Respondent */}
//       <div
//         style={{
//           marginTop: 16,
//           padding: 16,
//           border: "1px solid #ddd",
//           borderRadius: 6,
//           background: "#fafafa",
//         }}
//       >
//         <h2>{respondent.name}</h2>
//         <p>{respondent.email}</p>
//         <RespondentStatusBadge status={respondent.status} />
//       </div>

//       {/* 📋 Réponses */}
//       <h3 style={{ marginTop: 24 }}>📝 Réponses</h3>

//       {responses.length === 0 && <p>Aucune réponse enregistrée.</p>}

//       <ul style={{ marginTop: 16 }}>
//         {responses.map((r) => (
//           <li
//             key={r.id}
//             style={{
//               marginBottom: 12,
//               padding: 12,
//               border: "1px solid #eee",
//               borderRadius: 4,
//             }}
//           >
//             <strong>{r.questionLabel}</strong>
//             <div style={{ marginTop: 6 }}>
//               {Array.isArray(r.value) ? r.value.join(", ") : String(r.value)}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RespondentResponsePage;
