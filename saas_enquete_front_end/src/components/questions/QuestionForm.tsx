// src/components/questions/QuestionForm.tsx
import { useState } from "react";
import { QuestionType } from "../../types/question";

interface QuestionFormProps {
  onSubmit: (data: { label: string; type: QuestionType }) => void;
}

const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: "Texte court", value: "TEXT" },
  { label: "Texte long", value: "TEXTAREA" },
  { label: "Nombre", value: "NUMBER" },
  { label: "Choix unique", value: "SINGLE_CHOICE" },
  { label: "Choix multiple", value: "MULTIPLE_CHOICE" },
  { label: "Échelle", value: "SCALE" },
  { label: "Date", value: "DATE" },
  { label: "Email", value: "EMAIL" },
  { label: "Téléphone", value: "PHONE" },
];

const QuestionForm = ({ onSubmit }: QuestionFormProps) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<QuestionType>("TEXT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;
    onSubmit({ label, type });
    setLabel("");
    setType("TEXT");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 20,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "#f9f9f9",
      }}
    >
      <input
        type="text"
        placeholder="Libellé de la question"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as QuestionType)}
        style={{
          minWidth: 150,
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fff",
        }}
      >
        {QUESTION_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        style={{
          padding: "8px 16px",
          borderRadius: 4,
          border: "none",
          background: "#0d6efd",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        ➕ Ajouter
      </button>
    </form>
  );
};

export default QuestionForm;

// ===============================
// import { useState } from "react";
// // import { QuestionType } from "../../services/questionService";
// import QuestionTypeSelector from "./QuestionTypeSelector";
// import { QuestionType } from "../../types/question";

// interface Props {
//   onSubmit: (data: { label: string; type: QuestionType }) => void;
// }

// const QuestionForm = ({ onSubmit }: Props) => {
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");

//   const submit = () => {
//     if (!label.trim()) return;
//     onSubmit({ label, type });
//     setLabel("");
//     setType("TEXT");
//   };

//   return (
//     <div className="border p-3 mb-4">
//       <h4>➕ Ajouter une question</h4>

//       <input
//         className="form-control mb-2"
//         placeholder="Libellé de la question"
//         value={label}
//         onChange={(e) => setLabel(e.target.value)}
//       />

//       <QuestionTypeSelector value={type} onChange={setType} />

//       <button className="btn btn-primary mt-3" onClick={submit}>
//         Ajouter
//       </button>
//     </div>
//   );
// };

// export default QuestionForm;
