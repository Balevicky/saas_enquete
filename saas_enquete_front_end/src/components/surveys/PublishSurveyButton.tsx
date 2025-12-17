import React, { useState } from "react";
import surveyService from "../../services/surveyService";

interface PublishSurveyButtonProps {
  tenantSlug: string;
  surveyId: string;
  status?: string;
  onPublished?: () => void;
}

const PublishSurveyButton: React.FC<PublishSurveyButtonProps> = ({
  tenantSlug,
  surveyId,
  status,
  onPublished,
}) => {
  const [loading, setLoading] = useState(false);

  const isPublished = status === "PUBLISHED";

  const handlePublish = async () => {
    if (isPublished) return;

    try {
      setLoading(true);
      await surveyService.publish(tenantSlug, surveyId);
      onPublished?.();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication du survey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={loading || isPublished}
      style={{
        padding: "6px 12px",
        backgroundColor: isPublished ? "#ccc" : "#198754",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: isPublished ? "not-allowed" : "pointer",
      }}
    >
      {isPublished ? "✅ Publié" : loading ? "Publication..." : "🚀 Publier"}
    </button>
  );
};

export default PublishSurveyButton;
