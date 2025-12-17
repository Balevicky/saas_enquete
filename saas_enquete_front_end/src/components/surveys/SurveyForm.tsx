import { useState } from "react";

export interface SurveyFormValues {
  title: string;
  mode: "SIMPLE" | "ADVANCED";
}

interface SurveyFormProps {
  initialValues?: SurveyFormValues;
  onSubmit: (values: SurveyFormValues) => Promise<void> | void;
  loading?: boolean;
}

const SurveyForm = ({
  initialValues = { title: "", mode: "SIMPLE" },
  onSubmit,
  loading,
}: SurveyFormProps) => {
  const [title, setTitle] = useState(initialValues.title);
  const [mode, setMode] = useState<"SIMPLE" | "ADVANCED">(initialValues.mode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, mode });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 16 }}>
        <label className="fw-bold">Titre du survey</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="fw-bold">Mode</label>
        <select
          className="form-select"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="SIMPLE">Simple (questions manuelles)</option>
          <option value="ADVANCED">Avancé (Survey Builder)</option>
        </select>
      </div>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
};

export default SurveyForm;
