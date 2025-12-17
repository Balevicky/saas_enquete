import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import surveyService from "../../services/surveyService";

const SurveyCreatePage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  console.log("slug", tenantSlug);
  const submit = async () => {
    console.log("slug", tenantSlug);

    if (!tenantSlug) return;
    await surveyService.create(tenantSlug, { title });
    console.log("title", title);

    navigate(`/t/${tenantSlug}/surveys`);
  };

  return (
    <div className="p-4">
      <h2>Nouveau Survey</h2>
      <input
        className="form-control mt-3"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="btn btn-primary mt-3" onClick={submit}>
        Créer
      </button>
    </div>
  );
};

export default SurveyCreatePage;
