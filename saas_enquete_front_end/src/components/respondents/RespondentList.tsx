// src/components/respondents/RespondentList.tsx
import { Respondent } from "../../services/respondentService";
import RespondentStatusBadge from "./RespondentStatusBadge";
import { Link, useParams } from "react-router-dom";

interface Props {
  respondents: Respondent[];
}

const RespondentList = ({ respondents }: Props) => {
  const { tenantSlug } = useParams();

  return (
    <div>
      {respondents.map((r) => (
        <div
          key={r.id}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>
              {r.firstname} {r.name}
            </strong>
            <div style={{ fontSize: 12, color: "#666" }}>
              Started: {new Date(r.startedAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <RespondentStatusBadge completedAt={r.completedAt} />
            {/* <RespondentStatusBadge respondent={r} /> */}
            <Link to={`/t/${tenantSlug}/respondents/${r.id}`}>➜ Open</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RespondentList;

// ================================
// import { Link } from "react-router-dom";
// import { Respondent } from "../../services/respondentService";
// import RespondentStatusBadge from "./RespondentStatusBadge";

// interface Props {
//   respondents: Respondent[];
//   tenantSlug: string;
// }

// const RespondentList = ({ respondents, tenantSlug }: Props) => {
//   if (respondents.length === 0) {
//     return <p>Aucun participant.</p>;
//   }

//   return (
//     <ul style={{ padding: 0, listStyle: "none" }}>
//       {respondents.map((r) => (
//         <li
//           key={r.id}
//           style={{
//             padding: 12,
//             border: "1px solid #ddd",
//             borderRadius: 4,
//             marginBottom: 8,
//           }}
//         >
//           <strong>{r.name}</strong> — {r.email}{" "}
//           <RespondentStatusBadge status={r.status} />
//           <div style={{ marginTop: 6 }}>
//             <Link to={`/t/${tenantSlug}/respondents/${r.id}`}>Ouvrir →</Link>
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default RespondentList;

// ==================================================
// import { useEffect, useState } from "react";
// import {
//   Respondent,
//   respondentService,
// } from "../../services/respondentService";
// import RespondentStatusBadge from "./RespondentStatusBadge";

// interface Props {
//   tenantSlug: string;
//   surveyId: string;
// }

// const RespondentList = ({ tenantSlug, surveyId }: Props) => {
//   const [respondents, setRespondents] = useState<Respondent[]>([]);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await respondentService.list(tenantSlug, surveyId);
//       setRespondents(res.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   const completeRespondent = async (id: string) => {
//     await respondentService.complete(tenantSlug, id);
//     load();
//   };

//   if (loading) return <p>Chargement des participants...</p>;

//   return (
//     <div>
//       <h3>Participants</h3>
//       {respondents.map((r) => (
//         <div
//           key={r.id}
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             padding: 8,
//             borderBottom: "1px solid #eee",
//           }}
//         >
//           <div>
//             {r.name} ({r.email})
//           </div>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <RespondentStatusBadge status={r.status} />
//             {r.status === "pending" && (
//               <button onClick={() => completeRespondent(r.id)}>
//                 ✅ Terminer
//               </button>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RespondentList;

// =======================================
// import React, { useEffect, useState } from "react";
// import { respondentService } from "../../services/respondentService";
// import RespondentForm from "./RespondentForm";
// import RespondentDetail from "./RespondentDetail";
// interface Respondent {
//   id: string;
//   name: string;
//   email: string;
//   status: "pending" | "completed";
// }

// interface Props {
//   tenantSlug: string;
//   surveyId: string;
// }

// const RespondentList = ({ tenantSlug, surveyId }: Props) => {
//   const [respondents, setRespondents] = useState<Respondent[]>([]);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await respondentService.list(tenantSlug, surveyId);
//       setRespondents(res.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   const handleAdd = async (data: { name: string; email: string }) => {
//     await respondentService.create(tenantSlug, surveyId, data);
//     load();
//   };

//   const handleComplete = async (id: string) => {
//     await respondentService.complete(tenantSlug, id);
//     load();
//   };

//   if (loading) return <p>Chargement des respondents...</p>;

//   return (
//     <div>
//       <h3>Respondents</h3>
//       <RespondentForm onSubmit={handleAdd} />

//       {respondents.map((r) => (
//         <div
//           key={r.id}
//           style={{ display: "flex", alignItems: "center", gap: 12 }}
//         >
//           <RespondentDetail respondent={r} />
//           {r.status === "pending" && (
//             <button onClick={() => handleComplete(r.id)}>
//               Marquer comme complété
//             </button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RespondentList;
