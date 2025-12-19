// src/components/questions/QuestionForm.tsx
import { useState } from "react";
import { QuestionType } from "../../types/question";

interface QuestionFormProps {
  onSubmit: (data: {
    label: string;
    type: QuestionType;
    options?: string[];
    config?: { min: number; max: number };
    nextMap?: Record<string, string>;
    position: number;
  }) => void;
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
  const [position, setPosition] = useState(1);

  // Pour SINGLE / MULTIPLE
  const [options, setOptions] = useState<string[]>([""]);
  // Pour SCALE
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(5);
  // Pour SINGLE_CHOICE → nextMap
  const [nextMap, setNextMap] = useState<Record<string, string>>({});

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));

  const handleNextMapChange = (option: string, target: string) => {
    setNextMap((prev) => ({ ...prev, [option]: target }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = { label, type, position };

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      const cleanedOptions = options.filter((o) => o.trim() !== "");
      if (cleanedOptions.length === 0)
        return alert("Veuillez ajouter au moins une option");
      payload.options = cleanedOptions;
      if (type === "SINGLE_CHOICE") {
        payload.nextMap = nextMap;
      }
    }

    if (type === "SCALE") {
      if (min > max) return alert("Min ne peut pas être supérieur à Max");
      payload.config = { min, max };
    }

    onSubmit(payload);

    // reset
    setLabel("");
    setType("TEXT");
    setPosition((prev) => prev + 1);
    setOptions([""]);
    setMin(1);
    setMax(5);
    setNextMap({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border rounded mb-3"
      style={{ background: "#f9f9f9" }}
    >
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Libellé de la question"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
        >
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {type === "SCALE" && (
        <div className="mb-2 d-flex gap-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
          />
          <input
            type="number"
            className="form-control"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>
      )}

      {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
        <div className="mb-2">
          <label>Options :</label>
          {options.map((opt, idx) => (
            <div key={idx} className="input-group mb-1">
              <input
                type="text"
                className="form-control"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeOption(idx)}
              >
                🗑
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary mb-2"
            onClick={addOption}
          >
            ➕ Ajouter Option
          </button>
        </div>
      )}

      {type === "SINGLE_CHOICE" &&
        options.filter((o) => o.trim() !== "").length > 0 && (
          <div className="mb-2">
            <label>Condition SIMPLE (nextMap) :</label>
            {options.map((opt) => (
              <div key={opt} className="input-group mb-1">
                <span className="input-group-text">{opt} →</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ID question suivante"
                  value={nextMap[opt] || ""}
                  onChange={(e) => handleNextMapChange(opt, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

      <button type="submit" className="btn btn-primary mt-2">
        ➕ Ajouter
      </button>
    </form>
  );
};

export default QuestionForm;

// =====================================
// import { useState } from "react";
// import { QuestionType } from "../../types/question";

// interface QuestionFormProps {
//   onSubmit: (data: { label: string; type: QuestionType }) => void;
// }

// const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
//   { label: "Texte court", value: "TEXT" },
//   { label: "Texte long", value: "TEXTAREA" },
//   { label: "Nombre", value: "NUMBER" },
//   { label: "Choix unique", value: "SINGLE_CHOICE" },
//   { label: "Choix multiple", value: "MULTIPLE_CHOICE" },
//   { label: "Échelle", value: "SCALE" },
//   { label: "Date", value: "DATE" },
//   { label: "Email", value: "EMAIL" },
//   { label: "Téléphone", value: "PHONE" },
// ];

// const QuestionForm = ({ onSubmit }: QuestionFormProps) => {
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!label) return;
//     onSubmit({ label, type });
//     setLabel("");
//     setType("TEXT");
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         display: "flex",
//         gap: 12,
//         marginBottom: 20,
//         padding: 16,
//         border: "1px solid #ddd",
//         borderRadius: 6,
//         background: "#f9f9f9",
//       }}
//     >
//       <input
//         type="text"
//         placeholder="Libellé de la question"
//         value={label}
//         onChange={(e) => setLabel(e.target.value)}
//         style={{
//           flex: 1,
//           padding: 8,
//           borderRadius: 4,
//           border: "1px solid #ccc",
//         }}
//       />

//       <select
//         value={type}
//         onChange={(e) => setType(e.target.value as QuestionType)}
//         style={{
//           minWidth: 150,
//           padding: 8,
//           borderRadius: 4,
//           border: "1px solid #ccc",
//           background: "#fff",
//         }}
//       >
//         {QUESTION_TYPE_OPTIONS.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>

//       <button
//         type="submit"
//         style={{
//           padding: "8px 16px",
//           borderRadius: 4,
//           border: "none",
//           background: "#0d6efd",
//           color: "#fff",
//           cursor: "pointer",
//           fontWeight: 500,
//         }}
//       >
//         ➕ Ajouter
//       </button>
//     </form>
//   );
// };

// export default QuestionForm;

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
