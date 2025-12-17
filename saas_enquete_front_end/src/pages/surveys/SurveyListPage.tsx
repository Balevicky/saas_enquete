import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import surveyService, { Survey } from "../../services/surveyService";

const SurveyListPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!tenantSlug) return;

    setLoading(true);
    surveyService
      .list(tenantSlug, { page, perPage: 10 })
      .then((res) => setSurveys(res.data))
      .finally(() => setLoading(false));
  }, [tenantSlug, page]);

  if (loading) return <p>Chargement des surveys...</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📋 Surveys</h2>
        <Link to={`/t/${tenantSlug}/surveys/new`}>➕ Nouveau survey</Link>
      </div>

      {surveys.length === 0 && <p>Aucun survey disponible.</p>}

      <ul style={{ marginTop: 20 }}>
        {surveys.map((s) => (
          <li
            key={s.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 10,
            }}
          >
            <h3>{s.title}</h3>
            <small>
              👥 {s._count?.respondents ?? 0} respondents — 📝{" "}
              {s._count?.responses ?? 0} réponses
            </small>
            <br />
            <Link to={`/t/${tenantSlug}/surveys/${s.id}`}>Ouvrir</Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ◀ Précédent
        </button>
        <span style={{ margin: "0 10px" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Suivant ▶</button>
      </div>
    </div>
  );
};

export default SurveyListPage;
