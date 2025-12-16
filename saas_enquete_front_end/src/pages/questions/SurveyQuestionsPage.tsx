import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import questionService, {
  Question,
  QuestionType,
} from "../../services/questionService";

const SurveyQuestionsPage = () => {
  const { slug, surveyId } = useParams<{ slug: string; surveyId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<QuestionType>("TEXT");
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!slug || !surveyId) return;
    setLoading(true);
    questionService
      .list(slug, surveyId)
      .then((res) => setQuestions(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [slug, surveyId]);

  const createQuestion = async () => {
    if (!slug || !surveyId || !label) return;

    await questionService.create(slug, surveyId, {
      label,
      type,
      position: questions.length + 1,
    });

    setLabel("");
    setType("TEXT");
    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!slug || !surveyId) return;
    await questionService.remove(slug, surveyId, id);
    load();
  };

  if (loading) return <p>Chargement des questions...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>🧩 Questions du survey</h2>

      <div
        style={{
          margin: "20px 0",
          padding: 16,
          border: "1px solid #ddd",
        }}
      >
        <h4>➕ Ajouter une question</h4>
        <input
          placeholder="Libellé de la question"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
        >
          <option value="TEXT">Texte</option>
          <option value="NUMBER">Nombre</option>
          <option value="SELECT">Choix</option>
          <option value="BOOLEAN">Oui / Non</option>
        </select>
        <button onClick={createQuestion}>Ajouter</button>
      </div>

      {questions.length === 0 && <p>Aucune question définie.</p>}

      <ul>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: 8 }}>
            <strong>
              {q.position}. {q.label}
            </strong>{" "}
            ({q.type})
            <button
              style={{ marginLeft: 10 }}
              onClick={() => deleteQuestion(q.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurveyQuestionsPage;
