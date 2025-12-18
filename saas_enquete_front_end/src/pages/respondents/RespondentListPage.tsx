// src/pages/respondents/RespondentListPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  respondentService,
  Respondent,
} from "../../services/respondentService";
import RespondentList from "../../components/respondents/RespondentList";
import { exportRespondentsToExcel } from "../../utils/exportRespondents";

const RespondentListPage = () => {
  const { tenantSlug, surveyId } = useParams();
  const [respondents, setRespondents] = useState<Respondent[]>([]);

  useEffect(() => {
    if (!tenantSlug || !surveyId) return;

    respondentService
      .list(tenantSlug, surveyId)
      .then((res) => setRespondents(res.data.data));
  }, [tenantSlug, surveyId]);

  return (
    <div style={{ padding: 24 }}>
      <h2>👥 Respondents</h2>

      {/* 🔹 ACTIONS */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Link to={`/t/${tenantSlug}/surveys/${surveyId}/respondents/new`}>
          ➕ New respondent
        </Link>

        <button onClick={() => exportRespondentsToExcel(respondents)}>
          📊 Export Excel
        </button>
      </div>

      {/* 🔹 LIST */}
      <RespondentList respondents={respondents} />
    </div>
  );
};

export default RespondentListPage;

// ============================
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import respondentService, {
//   Respondent,
// } from "../../services/respondentService";
// import RespondentList from "../../components/respondents/RespondentList";

// const RespondentListPage = () => {
//   const { tenantSlug, surveyId } = useParams();
//   const [respondents, setRespondents] = useState<Respondent[]>([]);

//   useEffect(() => {
//     if (!tenantSlug || !surveyId) return;

//     respondentService
//       .list(tenantSlug, surveyId)
//       .then((res) => setRespondents(res.data.data));
//   }, [tenantSlug, surveyId]);

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>Respondents</h2>

//       <Link to={`/t/${tenantSlug}/surveys/${surveyId}/respondents/new`}>
//         ➕ New respondent
//       </Link>

//       <RespondentList respondents={respondents} />
//     </div>
//   );
// };

// export default RespondentListPage;

// ======================================================
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import RespondentList from "../../components/respondents/RespondentList";
// import {
//   respondentService,
//   Respondent,
// } from "../../services/respondentService";
// import {
//   exportRespondentsToCSV,
//   exportRespondentsToExcel,
// } from "../../utils/exportRespondents";

// const RespondentListPage = () => {
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [respondents, setRespondents] = useState<Respondent[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!tenantSlug || !surveyId) return;

//     setLoading(true);
//     respondentService
//       .list(tenantSlug, surveyId)
//       .then((res) => setRespondents(res.data))
//       .finally(() => setLoading(false));
//   }, [tenantSlug, surveyId]);

//   if (!tenantSlug || !surveyId) return null;
//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 16,
//           alignItems: "center",
//         }}
//       >
//         <h2>👥 Participants</h2>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button onClick={() => exportRespondentsToCSV(respondents)}>
//             📄 Export CSV
//           </button>

//           <button onClick={() => exportRespondentsToExcel(respondents)}>
//             📊 Export Excel
//           </button>

//           <Link to={`/t/${tenantSlug}/surveys/${surveyId}/respondents/new`}>
//             ➕ Ajouter
//           </Link>
//         </div>
//       </div>

//       <RespondentList respondents={respondents} tenantSlug={tenantSlug} />
//     </div>
//   );
// };

// export default RespondentListPage;

// ================================
// import { useParams, Link } from "react-router-dom";
// import RespondentList from "../../components/respondents/RespondentList";

// const RespondentListPage = () => {
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   if (!tenantSlug || !surveyId) return null;

//   return (
//     <div style={{ padding: 24 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 16,
//         }}
//       >
//         <h2>👥 Participants</h2>

//         <Link to={`/t/${tenantSlug}/surveys/${surveyId}/respondents/new`}>
//           ➕ Ajouter un participant
//         </Link>
//       </div>

//       <RespondentList tenantSlug={tenantSlug} surveyId={surveyId} />
//     </div>
//   );
// };

// export default RespondentListPage;
