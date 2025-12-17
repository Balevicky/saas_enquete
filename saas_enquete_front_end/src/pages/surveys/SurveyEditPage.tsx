import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import surveyService from "../../services/surveyService";

const SurveyEditPage = () => {
  const { slug, surveyId } = useParams<{ slug: string; surveyId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!slug || !surveyId) return;
    surveyService.get(slug, surveyId).then((s) => setTitle(s.title));
  }, [slug, surveyId]);

  const submit = async () => {
    if (!slug || !surveyId) return;
    await surveyService.update(slug, surveyId, { title });
    navigate(`/t/${slug}/surveys/${surveyId}`);
  };

  return (
    <div className="p-4">
      <h2>Éditer Survey</h2>
      <input
        className="form-control mt-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="btn btn-primary mt-3" onClick={submit}>
        Sauvegarder
      </button>
    </div>
  );
};

export default SurveyEditPage;
