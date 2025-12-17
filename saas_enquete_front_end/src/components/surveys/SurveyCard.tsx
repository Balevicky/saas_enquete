import { Link } from "react-router-dom";

export interface SurveyCardProps {
  slug: string;
  survey: {
    id: string;
    title: string;
    status?: string;
    _count?: {
      respondents?: number;
      responses?: number;
    };
  };
  onSelect?: (surveyId: string) => void;
}

const SurveyCard = ({ slug, survey, onSelect }: SurveyCardProps) => {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        background: "#fff",
      }}
    >
      <h3 style={{ marginBottom: 6 }}>{survey.title}</h3>

      <small style={{ color: "#6b7280" }}>
        👥 {survey._count?.respondents ?? 0} respondents — 📝{" "}
        {survey._count?.responses ?? 0} réponses
      </small>

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link
          to={`/t/${slug}/surveys/${survey.id}/questions`}
          onClick={() => onSelect?.(survey.id)}
        >
          Questions
        </Link>

        <Link to={`/t/${slug}/surveys/${survey.id}`}>Détails</Link>
      </div>
    </div>
  );
};

export default SurveyCard;
