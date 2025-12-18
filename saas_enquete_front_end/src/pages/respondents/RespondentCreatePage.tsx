// src/pages/respondents/RespondentCreatePage.tsx
import { useParams, useNavigate } from "react-router-dom";
import RespondentForm from "../../components/respondents/RespondentForm";
// import respondentService from "../../services/respondentService";
import { respondentService } from "../../services/respondentService";
const RespondentCreatePage = () => {
  const { tenantSlug, surveyId } = useParams();
  const navigate = useNavigate();

  const create = async (data: any) => {
    if (!tenantSlug || !surveyId) return;

    await respondentService.create(tenantSlug, surveyId, data);
    navigate(`/t/${tenantSlug}/surveys/${surveyId}/respondents`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>New respondent</h2>
      <RespondentForm onSubmit={create} />
    </div>
  );
};

export default RespondentCreatePage;

// ========================================
// import { useNavigate, useParams } from "react-router-dom";
// import RespondentForm from "../../components/respondents/RespondentForm";

// const RespondentCreatePage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   if (!tenantSlug || !surveyId) return null;

//   return (
//     <div style={{ padding: 24, maxWidth: 600 }}>
//       <h2>➕ Nouveau participant</h2>

//       <RespondentForm
//         tenantSlug={tenantSlug}
//         surveyId={surveyId}
//         onCreated={() =>
//           navigate(`/t/${tenantSlug}/surveys/${surveyId}/respondents`)
//         }
//       />
//     </div>
//   );
// };

// export default RespondentCreatePage;
