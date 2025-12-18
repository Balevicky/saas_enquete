// src/components/respondents/RespondentDetail.tsx
import { Respondent } from "../../services/respondentService";
import RespondentStatusBadge from "./RespondentStatusBadge";

interface Props {
  respondent: Respondent & { responses?: any[] };
}

const RespondentDetail = ({ respondent }: Props) => {
  return (
    <div>
      <h3>
        {respondent.firstname} {respondent.name}
      </h3>

      <RespondentStatusBadge completedAt={respondent.completedAt} />

      <p>Started at: {new Date(respondent.startedAt).toLocaleString()}</p>

      {respondent.responses && (
        <>
          <h4>Responses de survey </h4>
          {respondent.responses.map((r) => (
            <div key={r.id}>
              <strong>{r.question.label}</strong>
              <div>{r.value}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RespondentDetail;

// ===========================================
// import { useEffect, useState } from "react";
// import {
//   Respondent,
//   respondentService,
// } from "../../services/respondentService";

// interface Props {
//   tenantSlug: string;
//   respondentId: string;
// }

// const RespondentDetail = ({ tenantSlug, respondentId }: Props) => {
//   const [respondent, setRespondent] = useState<Respondent | null>(null);

//   const load = async () => {
//     const res = await respondentService.get(tenantSlug, respondentId);
//     setRespondent(res.data);
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, respondentId]);

//   if (!respondent) return <p>Chargement...</p>;

//   return (
//     <div>
//       <h4>{respondent.name}</h4>
//       <p>Email: {respondent.email}</p>
//       <p>Status: {respondent.status}</p>
//     </div>
//   );
// };

// export default RespondentDetail;

// =====================================
// import React from "react";
// import { respondentService } from "../../services/respondentService";
// import RespondentStatusBadge from "./RespondentStatusBadge";

// interface Props {
//   respondent: {
//     id: string;
//     name: string;
//     email: string;
//     status: "pending" | "completed";
//   };
// }

// const RespondentDetail = ({ respondent }: Props) => {
//   return (
//     <div
//       style={{
//         border: "1px solid #ddd",
//         padding: 12,
//         borderRadius: 4,
//         marginBottom: 8,
//       }}
//     >
//       <div>
//         <strong>{respondent.name}</strong> ({respondent.email})
//       </div>
//       <RespondentStatusBadge status={respondent.status} />
//     </div>
//   );
// };

// export default RespondentDetail;
