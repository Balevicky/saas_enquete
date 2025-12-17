import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import surveyService, { Survey } from "../../services/surveyService";

const SurveyDetailPage = () => {
  const { tenantSlug, surveyId } = useParams<{
    tenantSlug: string;
    surveyId: string;
  }>();
  const [survey, setSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (!tenantSlug || !surveyId) return;
    surveyService.get(tenantSlug, surveyId).then(setSurvey);
  }, [tenantSlug, surveyId]);

  if (!survey) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2>{survey.title}</h2>

      <div className="mt-3">
        <Link to={`/t/${tenantSlug}/surveys/${survey.id}/edit`}>✏️ Éditer</Link>{" "}
        |{" "}
        <Link to={`/t/${tenantSlug}/surveys/${survey.id}/questions`}>
          🧩 Questions
        </Link>
      </div>
    </div>
  );
};

export default SurveyDetailPage;
