// src/pages/respondents/RespondentDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import respondentService from "../../services/respondentService";
import { respondentService } from "../../services/respondentService";
import RespondentDetail from "../../components/respondents/RespondentDetail";

const RespondentDetailPage = () => {
  const { tenantSlug, respondentId } = useParams();
  const [respondent, setRespondent] = useState<any>(null);

  useEffect(() => {
    if (!tenantSlug || !respondentId) return;

    respondentService
      .get(tenantSlug, respondentId)
      .then((res) => setRespondent(res.data));
  }, [tenantSlug, respondentId]);

  if (!respondent) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <RespondentDetail respondent={respondent} />
    </div>
  );
};

export default RespondentDetailPage;

// ===============================
// import { useParams, Link } from "react-router-dom";
// import RespondentDetail from "../../components/respondents/RespondentDetail";

// const RespondentDetailPage = () => {
//   const { tenantSlug, respondentId } = useParams<{
//     tenantSlug: string;
//     respondentId: string;
//   }>();

//   if (!tenantSlug || !respondentId) return null;

//   return (
//     <div style={{ padding: 24 }}>
//       <Link to=".." relative="path">
//         ◀ Retour
//       </Link>
//       <Link to={`/t/${tenantSlug}/respondents/${respondentId}/responses`}>
//         📝 Voir les réponses
//       </Link>
//       <div style={{ marginTop: 16 }}>
//         <RespondentDetail tenantSlug={tenantSlug} respondentId={respondentId} />
//       </div>
//     </div>
//   );
// };

// export default RespondentDetailPage;
