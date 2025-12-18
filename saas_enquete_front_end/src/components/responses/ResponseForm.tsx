// src/components/responses/ResponseForm.tsx
import React, { useState } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { responseService } from "../../services/responseService";
import { QuestionType } from "../../types/question";

interface Question {
  id: string;
  text: string;
  //   type: string;
  type: QuestionType; // <-- utiliser QuestionType ici
  options?: string[];
}

interface Props {
  slug: string;
  respondentId: string;
  questions: Question[];
}

const ResponseForm = ({ slug, respondentId, questions }: Props) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prépare le tableau d'answers pour le backend
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await responseService.saveAll(slug, respondentId, payload);
      setMessage("Réponses envoyées avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'envoi des réponses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((q) => (
        <QuestionRenderer
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={handleChange}
        />
      ))}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer"}
      </button>
      {message && <div className="mt-3 alert alert-info">{message}</div>}
    </form>
  );
};

export default ResponseForm;
