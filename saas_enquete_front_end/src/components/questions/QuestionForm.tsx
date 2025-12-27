// src/components/questions/QuestionForm.tsx
// src/components/questions/QuestionForm.tsx
import { useState, useEffect, useMemo } from "react";
import { QuestionType } from "../../types/question";
import QuestionPreview from "./QuestionPreview";
import { Section } from "../../services/sectionService";

interface QuestionFormProps {
  allQuestions: {
    id: string;
    label: string;
    position: number;
    sectionId?: string | null;
  }[]; // Liste des questions pour nextMap
  sections: Section[]; // Ajouté pour afficher les sections
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

const QuestionForm = ({
  onSubmit,
  allQuestions,
  sections,
}: QuestionFormProps) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<QuestionType>("TEXT");
  const [position, setPosition] = useState(1);

  const [options, setOptions] = useState<string[]>([""]);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(5);
  const [nextMap, setNextMap] = useState<Record<string, string>>({});

  const [showPreview, setShowPreview] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    label?: string;
    options?: string;
    scale?: string;
  }>({});

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  /* ======================
       SECTION INDEX HELPERS
  ====================== */
  const sectionIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    sections.forEach((s, idx) => (map[s.id] = idx));
    return map;
  }, [sections]);

  const currentSectionIndex = 0; // Nouvelle question, on la considère dans la première section

  const firstQuestionOfNextSectionId = useMemo(() => {
    const nextSection = sections[currentSectionIndex + 1];
    if (!nextSection) return null;

    const qs = allQuestions
      .filter((q) => q.sectionId === nextSection.id)
      .sort((a, b) => a.position - b.position);

    return qs.length > 0 ? qs[0].id : null;
  }, [sections, allQuestions, currentSectionIndex]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!label.trim()) errors.label = "Le libellé de la question est requis.";

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      const filledOptions = options.filter((o) => o.trim() !== "");
      if (filledOptions.length === 0)
        errors.options = "Au moins une option est requise.";
    }

    if (type === "SCALE" && min > max) {
      errors.scale = "Min ne peut pas être supérieur à Max.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ======================
       QUESTIONS GROUPÉES
  ====================== */
  const questionsBySection = useMemo(() => {
    const map: Record<
      string,
      {
        question: (typeof allQuestions)[number];
        disabled: boolean;
        reason?: string;
      }[]
    > = {};

    allQuestions.forEach((q) => {
      const targetSectionIndex = sectionIndexMap[q.sectionId ?? ""] ?? 0;

      let allowed = false;
      let reason = "";

      if (targetSectionIndex <= currentSectionIndex) {
        allowed = true;
      } else if (
        targetSectionIndex === currentSectionIndex + 1 &&
        q.id === firstQuestionOfNextSectionId
      ) {
        allowed = true;
      } else {
        reason = "⚠️ section ultérieure (non autorisée)";
      }

      const key = q.sectionId || "__unassigned__";
      if (!map[key]) map[key] = [];

      map[key].push({
        question: q,
        disabled: !allowed,
        reason,
      });
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.question.position - b.question.position)
    );

    return map;
  }, [
    allQuestions,
    sectionIndexMap,
    currentSectionIndex,
    firstQuestionOfNextSectionId,
  ]);

  const getSectionTitle = (sectionId: string) => {
    if (sectionId === "__unassigned__") return "🗂️ Sans section";
    const section = sections.find((s) => s.id === sectionId);
    return section ? `📂 ${section.title}` : "📂 Section inconnue";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setToast({
        message: "Veuillez corriger les erreurs avant de continuer",
        type: "danger",
      });
      return;
    }

    const payload: any = { label, type, position };

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      payload.options = options.filter((o) => o.trim() !== "");
      if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
    }

    if (type === "SCALE") payload.config = { min, max };

    try {
      onSubmit(payload);
      setToast({ message: "Question ajoutée avec succès !", type: "success" });

      // reset
      setLabel("");
      setType("TEXT");
      setPosition((prev) => prev + 1);
      setOptions([""]);
      setMin(1);
      setMax(5);
      setNextMap({});
      setFieldErrors({});
    } catch {
      setToast({
        message: "Erreur lors de l'ajout de la question",
        type: "danger",
      });
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="p-3 border rounded mb-3"
        style={{ background: "#f9f9f9" }}
      >
        {/* ===== Libellé ===== */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Libellé de la question"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          {fieldErrors.label && (
            <div className="text-danger mt-1">{fieldErrors.label}</div>
          )}
        </div>

        {/* ===== Type ===== */}
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

        {/* ===== SCALE ===== */}
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
        {fieldErrors.scale && (
          <div className="text-danger mb-2">{fieldErrors.scale}</div>
        )}

        {/* ===== OPTIONS ===== */}
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
            {fieldErrors.options && (
              <div className="text-danger">{fieldErrors.options}</div>
            )}
          </div>
        )}

        {/* ===== nextMap (Condition SIMPLE) ===== */}
        {type === "SINGLE_CHOICE" &&
          options.filter((o) => o.trim() !== "").length > 0 && (
            <div className="mb-2">
              <label>Condition SIMPLE (nextMap) :</label>
              {options.map((opt) => (
                <div key={opt} className="input-group mb-1">
                  <span className="input-group-text">{opt} →</span>
                  <select
                    className="form-select"
                    value={nextMap[opt] || ""}
                    onChange={(e) => handleNextMapChange(opt, e.target.value)}
                  >
                    <option value="">-- Choisir la question suivante --</option>
                    {Object.entries(questionsBySection).map(
                      ([sectionId, entries]) => (
                        <optgroup
                          key={sectionId}
                          label={getSectionTitle(sectionId)}
                        >
                          {entries.map(({ question: q, disabled, reason }) => (
                            <option key={q.id} value={q.id} disabled={disabled}>
                              {q.position}. {q.label}
                              {disabled ? ` ${reason}` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                </div>
              ))}
            </div>
          )}

        {/* ===== Boutons Ajouter + Aperçu ===== */}
        <div className="d-flex flex-wrap gap-2 mb-2">
          <button type="submit" className="btn btn-primary">
            ➕ Ajouter
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowPreview((p) => !p)}
          >
            👁️ {showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
          </button>
        </div>

        {/* ===== Aperçu ===== */}
        {showPreview && (
          <div className="mb-3">
            <label className="form-label">
              <strong>Aperçu de la question :</strong>
            </label>
            <QuestionPreview
              label={label || "Titre de la question"}
              type={type}
              options={options.filter((o) => o.trim() !== "")}
              config={{ min, max }}
              nextMap={nextMap}
            />
          </div>
        )}
      </form>

      {/* ===== Toast ===== */}
      {toast && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show`}
          style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast(null)}
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionForm;

// ============================ TRES bon avec la Condition SIMPLE (nextMap) permet de selctionner et les bouton Ajouter et Affiche aperçu ne chevauchent pas
// src/components/questions/QuestionForm.tsx
// import { useState, useEffect } from "react";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";

// interface QuestionFormProps {
//   allQuestions: { id: string; label: string; position: number }[]; // Liste des questions pour nextMap
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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

// const QuestionForm = ({ onSubmit, allQuestions }: QuestionFormProps) => {
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");
//   const [position, setPosition] = useState(1);

//   const [options, setOptions] = useState<string[]>([""]);
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const [showPreview, setShowPreview] = useState(false);

//   const [fieldErrors, setFieldErrors] = useState<{
//     label?: string;
//     options?: string;
//     scale?: string;
//   }>({});

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));

//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const validate = () => {
//     const errors: typeof fieldErrors = {};

//     if (!label.trim()) errors.label = "Le libellé de la question est requis.";

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         errors.options = "Au moins une option est requise.";
//     }

//     if (type === "SCALE" && min > max) {
//       errors.scale = "Min ne peut pas être supérieur à Max.";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       setToast({
//         message: "Veuillez corriger les erreurs avant de continuer",
//         type: "danger",
//       });
//       return;
//     }

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim() !== "");
//       if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
//     }

//     if (type === "SCALE") payload.config = { min, max };

//     try {
//       onSubmit(payload);
//       setToast({ message: "Question ajoutée avec succès !", type: "success" });

//       // reset
//       setLabel("");
//       setType("TEXT");
//       setPosition((prev) => prev + 1);
//       setOptions([""]);
//       setMin(1);
//       setMax(5);
//       setNextMap({});
//       setFieldErrors({});
//     } catch {
//       setToast({
//         message: "Erreur lors de l'ajout de la question",
//         type: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="p-3 border rounded mb-3"
//         style={{ background: "#f9f9f9" }}
//       >
//         {/* ===== Libellé ===== */}
//         <div className="mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Libellé de la question"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//           />
//           {fieldErrors.label && (
//             <div className="text-danger mt-1">{fieldErrors.label}</div>
//           )}
//         </div>

//         {/* ===== Type ===== */}
//         <div className="mb-2">
//           <select
//             className="form-select"
//             value={type}
//             onChange={(e) => setType(e.target.value as QuestionType)}
//           >
//             {QUESTION_TYPE_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ===== SCALE ===== */}
//         {type === "SCALE" && (
//           <div className="mb-2 d-flex gap-2">
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Min"
//               value={min}
//               onChange={(e) => setMin(Number(e.target.value))}
//             />
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Max"
//               value={max}
//               onChange={(e) => setMax(Number(e.target.value))}
//             />
//           </div>
//         )}
//         {fieldErrors.scale && (
//           <div className="text-danger mb-2">{fieldErrors.scale}</div>
//         )}

//         {/* ===== OPTIONS ===== */}
//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//           <div className="mb-2">
//             <label>Options :</label>
//             {options.map((opt, idx) => (
//               <div key={idx} className="input-group mb-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => removeOption(idx)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="btn btn-secondary mb-2"
//               onClick={addOption}
//             >
//               ➕ Ajouter Option
//             </button>
//             {fieldErrors.options && (
//               <div className="text-danger">{fieldErrors.options}</div>
//             )}
//           </div>
//         )}

//         {/* ===== nextMap (Condition SIMPLE) ===== */}
//         {type === "SINGLE_CHOICE" &&
//           options.filter((o) => o.trim() !== "").length > 0 && (
//             <div className="mb-2">
//               <label>Condition SIMPLE (nextMap) :</label>
//               {options.map((opt) => (
//                 <div key={opt} className="input-group mb-1">
//                   <span className="input-group-text">{opt} →</span>
//                   <select
//                     className="form-select"
//                     value={nextMap[opt] || ""}
//                     onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                   >
//                     <option value="">-- Choisir la question suivante --</option>
//                     {allQuestions
//                       // 🚫 Empêche de sélectionner une question précédente
//                       .filter((q) => q.position > position)
//                       .map((q) => (
//                         <option key={q.id} value={q.id}>
//                           {q.label}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           )}

//         {/* ===== Boutons Ajouter + Aperçu ===== */}
//         <div className="d-flex flex-wrap gap-2 mb-2">
//           <button type="submit" className="btn btn-primary">
//             ➕ Ajouter
//           </button>
//           <button
//             type="button"
//             className="btn btn-sm btn-outline-secondary"
//             onClick={() => setShowPreview((p) => !p)}
//           >
//             👁️ {showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
//           </button>
//         </div>

//         {/* ===== Aperçu ===== */}
//         {showPreview && (
//           <div className="mb-3">
//             <label className="form-label">
//               <strong>Aperçu de la question :</strong>
//             </label>
//             <QuestionPreview
//               label={label || "Titre de la question"}
//               type={type}
//               options={options.filter((o) => o.trim() !== "")}
//               config={{ min, max }}
//               nextMap={nextMap}
//             />
//           </div>
//         )}
//       </form>

//       {/* ===== Toast ===== */}
//       {toast && (
//         <div
//           className={`toast align-items-center text-bg-${toast.type} border-0 show`}
//           style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//             <button
//               type="button"
//               className="btn-close btn-close-white me-2 m-auto"
//               onClick={() => setToast(null)}
//             ></button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default QuestionForm;

// ============================ bon avec la Condition SIMPLE (nextMap) permet de selctionner et les bouton Ajouter et Affiche aperçu ne chevauchent pas
// import { useState, useEffect } from "react";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";

// interface QuestionFormProps {
//   allQuestions: { id: string; label: string }[]; // Liste des questions pour nextMap
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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

// const QuestionForm = ({ onSubmit, allQuestions }: QuestionFormProps) => {
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");
//   const [position, setPosition] = useState(1);

//   const [options, setOptions] = useState<string[]>([""]);
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const [showPreview, setShowPreview] = useState(false);

//   const [fieldErrors, setFieldErrors] = useState<{
//     label?: string;
//     options?: string;
//     scale?: string;
//   }>({});

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));

//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const validate = () => {
//     const errors: typeof fieldErrors = {};

//     if (!label.trim()) errors.label = "Le libellé de la question est requis.";

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         errors.options = "Au moins une option est requise.";
//     }

//     if (type === "SCALE" && min > max) {
//       errors.scale = "Min ne peut pas être supérieur à Max.";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       setToast({
//         message: "Veuillez corriger les erreurs avant de continuer",
//         type: "danger",
//       });
//       return;
//     }

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim() !== "");
//       if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
//     }

//     if (type === "SCALE") payload.config = { min, max };

//     try {
//       onSubmit(payload);
//       setToast({ message: "Question ajoutée avec succès !", type: "success" });

//       // reset
//       setLabel("");
//       setType("TEXT");
//       setPosition((prev) => prev + 1);
//       setOptions([""]);
//       setMin(1);
//       setMax(5);
//       setNextMap({});
//       setFieldErrors({});
//     } catch {
//       setToast({
//         message: "Erreur lors de l'ajout de la question",
//         type: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="p-3 border rounded mb-3"
//         style={{ background: "#f9f9f9" }}
//       >
//         {/* ===== Libellé ===== */}
//         <div className="mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Libellé de la question"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//           />
//           {fieldErrors.label && (
//             <div className="text-danger mt-1">{fieldErrors.label}</div>
//           )}
//         </div>

//         {/* ===== Type ===== */}
//         <div className="mb-2">
//           <select
//             className="form-select"
//             value={type}
//             onChange={(e) => setType(e.target.value as QuestionType)}
//           >
//             {QUESTION_TYPE_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ===== SCALE ===== */}
//         {type === "SCALE" && (
//           <div className="mb-2 d-flex gap-2">
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Min"
//               value={min}
//               onChange={(e) => setMin(Number(e.target.value))}
//             />
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Max"
//               value={max}
//               onChange={(e) => setMax(Number(e.target.value))}
//             />
//           </div>
//         )}
//         {fieldErrors.scale && (
//           <div className="text-danger mb-2">{fieldErrors.scale}</div>
//         )}

//         {/* ===== OPTIONS ===== */}
//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//           <div className="mb-2">
//             <label>Options :</label>
//             {options.map((opt, idx) => (
//               <div key={idx} className="input-group mb-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => removeOption(idx)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="btn btn-secondary mb-2"
//               onClick={addOption}
//             >
//               ➕ Ajouter Option
//             </button>
//             {fieldErrors.options && (
//               <div className="text-danger">{fieldErrors.options}</div>
//             )}
//           </div>
//         )}

//         {/* ===== nextMap ===== */}
//         {type === "SINGLE_CHOICE" &&
//           options.filter((o) => o.trim() !== "").length > 0 && (
//             <div className="mb-2">
//               <label>Condition SIMPLE (nextMap) :</label>
//               {options.map((opt) => (
//                 <div key={opt} className="input-group mb-1">
//                   <span className="input-group-text">{opt} →</span>
//                   <select
//                     className="form-select"
//                     value={nextMap[opt] || ""}
//                     onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                   >
//                     <option value="">-- Choisir la question suivante --</option>
//                     {allQuestions
//                       .filter((q) => q.label !== label)
//                       .map((q) => (
//                         <option key={q.id} value={q.id}>
//                           {q.label}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           )}

//         {/* ===== Boutons Ajouter + Aperçu ===== */}
//         <div className="d-flex flex-wrap gap-2 mb-2">
//           <button type="submit" className="btn btn-primary">
//             ➕ Ajouter
//           </button>
//           <button
//             type="button"
//             className="btn btn-sm btn-outline-secondary"
//             onClick={() => setShowPreview((p) => !p)}
//           >
//             👁️ {showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
//           </button>
//         </div>

//         {/* ===== Aperçu ===== */}
//         {showPreview && (
//           <div className="mb-3">
//             <label className="form-label">
//               <strong>Aperçu de la question :</strong>
//             </label>
//             <QuestionPreview
//               label={label || "Titre de la question"}
//               type={type}
//               options={options.filter((o) => o.trim() !== "")}
//               config={{ min, max }}
//               nextMap={nextMap}
//             />
//           </div>
//         )}
//       </form>

//       {/* ===== Toast ===== */}
//       {toast && (
//         <div
//           className={`toast align-items-center text-bg-${toast.type} border-0 show`}
//           style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//             <button
//               type="button"
//               className="btn-close btn-close-white me-2 m-auto"
//               onClick={() => setToast(null)}
//             ></button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default QuestionForm;

// ========================================== bon avec la Condition SIMPLE (nextMap) ne permet de selctionner mais les bouton Ajouter et Affiche aperçu chevauchent
// import { useState, useEffect } from "react";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";

// interface QuestionFormProps {
//   allQuestions: { id: string; label: string }[]; // Liste des questions pour nextMap
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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

// const QuestionForm = ({ onSubmit, allQuestions }: QuestionFormProps) => {
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");
//   const [position, setPosition] = useState(1);

//   const [options, setOptions] = useState<string[]>([""]);
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const [showPreview, setShowPreview] = useState(false);

//   const [fieldErrors, setFieldErrors] = useState<{
//     label?: string;
//     options?: string;
//     scale?: string;
//   }>({});

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));

//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const validate = () => {
//     const errors: typeof fieldErrors = {};

//     if (!label.trim()) errors.label = "Le libellé de la question est requis.";

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         errors.options = "Au moins une option est requise.";
//     }

//     if (type === "SCALE" && min > max) {
//       errors.scale = "Min ne peut pas être supérieur à Max.";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       setToast({
//         message: "Veuillez corriger les erreurs avant de continuer",
//         type: "danger",
//       });
//       return;
//     }

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim() !== "");
//       if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
//     }

//     if (type === "SCALE") payload.config = { min, max };

//     try {
//       onSubmit(payload);
//       setToast({ message: "Question ajoutée avec succès !", type: "success" });

//       // reset
//       setLabel("");
//       setType("TEXT");
//       setPosition((prev) => prev + 1);
//       setOptions([""]);
//       setMin(1);
//       setMax(5);
//       setNextMap({});
//       setFieldErrors({});
//     } catch {
//       setToast({
//         message: "Erreur lors de l'ajout de la question",
//         type: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="p-3 border rounded mb-3"
//         style={{ background: "#f9f9f9" }}
//       >
//         {/* ===== Libellé ===== */}
//         <div className="mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Libellé de la question"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//           />
//           {fieldErrors.label && (
//             <div className="text-danger mt-1">{fieldErrors.label}</div>
//           )}
//         </div>

//         {/* ===== Type ===== */}
//         <div className="mb-2">
//           <select
//             className="form-select"
//             value={type}
//             onChange={(e) => setType(e.target.value as QuestionType)}
//           >
//             {QUESTION_TYPE_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ===== SCALE ===== */}
//         {type === "SCALE" && (
//           <div className="mb-2 d-flex gap-2">
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Min"
//               value={min}
//               onChange={(e) => setMin(Number(e.target.value))}
//             />
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Max"
//               value={max}
//               onChange={(e) => setMax(Number(e.target.value))}
//             />
//           </div>
//         )}
//         {fieldErrors.scale && (
//           <div className="text-danger mb-2">{fieldErrors.scale}</div>
//         )}

//         {/* ===== OPTIONS ===== */}
//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//           <div className="mb-2">
//             <label>Options :</label>
//             {options.map((opt, idx) => (
//               <div key={idx} className="input-group mb-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => removeOption(idx)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="btn btn-secondary mb-2"
//               onClick={addOption}
//             >
//               ➕ Ajouter Option
//             </button>
//             {fieldErrors.options && (
//               <div className="text-danger">{fieldErrors.options}</div>
//             )}
//           </div>
//         )}

//         {/* ===== nextMap corrigé ===== */}
//         {type === "SINGLE_CHOICE" &&
//           options.filter((o) => o.trim() !== "").length > 0 && (
//             <div className="mb-2">
//               <label>Condition SIMPLE (nextMap) :</label>
//               {options.map((opt) => (
//                 <div key={opt} className="input-group mb-1">
//                   <span className="input-group-text">{opt} →</span>
//                   <select
//                     className="form-select"
//                     value={nextMap[opt] || ""}
//                     onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                   >
//                     <option value="">-- Choisir la question suivante --</option>
//                     {allQuestions
//                       .filter((q) => q.label !== label) // exclure la question courante
//                       .map((q) => (
//                         <option key={q.id} value={q.id}>
//                           {q.label}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           )}

//         {/* 👁️ Bouton Aperçu */}
//         <button
//           type="button"
//           className="btn btn-sm btn-outline-secondary mb-2"
//           onClick={() => setShowPreview((p) => !p)}
//         >
//           👁️ {showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
//         </button>

//         {/* ===== Aperçu ===== */}
//         {showPreview && (
//           <div className="mb-3">
//             <label className="form-label">
//               <strong>Aperçu de la question :</strong>
//             </label>
//             <QuestionPreview
//               label={label || "Titre de la question"}
//               type={type}
//               options={options.filter((o) => o.trim() !== "")}
//               config={{ min, max }}
//               nextMap={nextMap}
//             />
//           </div>
//         )}

//         <button type="submit" className="btn btn-primary mt-2">
//           ➕ Ajouter
//         </button>
//       </form>

//       {/* ===== Toast ===== */}
//       {toast && (
//         <div
//           className={`toast align-items-center text-bg-${toast.type} border-0 show`}
//           style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//             <button
//               type="button"
//               className="btn-close btn-close-white me-2 m-auto"
//               onClick={() => setToast(null)}
//             ></button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default QuestionForm;

// ========================================== bon mais la Condition SIMPLE (nextMap) ne permet de selctionner
// // // src/components/questions/QuestionForm.tsx
// import { useState, useEffect } from "react";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";

// interface QuestionFormProps {
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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
//   const [position, setPosition] = useState(1);

//   const [options, setOptions] = useState<string[]>([""]);
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const [showPreview, setShowPreview] = useState(true); // 👁️ AJOUT

//   const [fieldErrors, setFieldErrors] = useState<{
//     label?: string;
//     options?: string;
//     scale?: string;
//   }>({});

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));

//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const validate = () => {
//     const errors: typeof fieldErrors = {};

//     if (!label.trim()) errors.label = "Le libellé de la question est requis.";

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         errors.options = "Au moins une option est requise.";
//     }

//     if (type === "SCALE" && min > max) {
//       errors.scale = "Min ne peut pas être supérieur à Max.";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       setToast({
//         message: "Veuillez corriger les erreurs avant de continuer",
//         type: "danger",
//       });
//       return;
//     }

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim() !== "");
//       if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
//     }

//     if (type === "SCALE") payload.config = { min, max };

//     try {
//       onSubmit(payload);
//       setToast({ message: "Question ajoutée avec succès !", type: "success" });

//       // reset
//       setLabel("");
//       setType("TEXT");
//       setPosition((prev) => prev + 1);
//       setOptions([""]);
//       setMin(1);
//       setMax(5);
//       setNextMap({});
//       setFieldErrors({});
//     } catch {
//       setToast({
//         message: "Erreur lors de l'ajout de la question",
//         type: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="p-3 border rounded mb-3"
//         style={{ background: "#f9f9f9" }}
//       >
//         {/* ===== Libellé ===== */}
//         <div className="mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Libellé de la question"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//           />
//           {fieldErrors.label && (
//             <div className="text-danger mt-1">{fieldErrors.label}</div>
//           )}
//         </div>

//         {/* ===== Type ===== */}
//         <div className="mb-2">
//           <select
//             className="form-select"
//             value={type}
//             onChange={(e) => setType(e.target.value as QuestionType)}
//           >
//             {QUESTION_TYPE_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ===== SCALE ===== */}
//         {type === "SCALE" && (
//           <div className="mb-2 d-flex gap-2">
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Min"
//               value={min}
//               onChange={(e) => setMin(Number(e.target.value))}
//             />
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Max"
//               value={max}
//               onChange={(e) => setMax(Number(e.target.value))}
//             />
//           </div>
//         )}
//         {fieldErrors.scale && (
//           <div className="text-danger mb-2">{fieldErrors.scale}</div>
//         )}

//         {/* ===== OPTIONS ===== */}
//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//           <div className="mb-2">
//             <label>Options :</label>
//             {options.map((opt, idx) => (
//               <div key={idx} className="input-group mb-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => removeOption(idx)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="btn btn-secondary mb-2"
//               onClick={addOption}
//             >
//               ➕ Ajouter Option
//             </button>
//             {fieldErrors.options && (
//               <div className="text-danger">{fieldErrors.options}</div>
//             )}
//           </div>
//         )}

//         {/* ===== nextMap ===== */}
//         {type === "SINGLE_CHOICE" &&
//           options.filter((o) => o.trim() !== "").length > 0 && (
//             <div className="mb-2">
//               <label>Condition SIMPLE (nextMap) :</label>
//               {options.map((opt) => (
//                 <div key={opt} className="input-group mb-1">
//                   <span className="input-group-text">{opt} →</span>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="ID question suivante"
//                     value={nextMap[opt] || ""}
//                     onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//         {/* 👁️ Bouton Aperçu */}
//         <button
//           type="button"
//           className="btn btn-sm btn-outline-secondary mb-2"
//           onClick={() => setShowPreview((p) => !p)}
//         >
//           👁️ {showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
//         </button>

//         {/* ===== Aperçu ===== */}
//         {showPreview && (
//           <div className="mb-3">
//             <label className="form-label">
//               <strong>Aperçu de la question :</strong>
//             </label>
//             <QuestionPreview
//               label={label || "Titre de la question"}
//               type={type}
//               options={options.filter((o) => o.trim() !== "")}
//               config={{ min, max }}
//               nextMap={nextMap}
//             />
//           </div>
//         )}

//         <button type="submit" className="btn btn-primary mt-2">
//           ➕ Ajouter
//         </button>
//       </form>

//       {/* ===== Toast ===== */}
//       {toast && (
//         <div
//           className={`toast align-items-center text-bg-${toast.type} border-0 show`}
//           style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//             <button
//               type="button"
//               className="btn-close btn-close-white me-2 m-auto"
//               onClick={() => setToast(null)}
//             ></button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default QuestionForm;

// ========================================== bon mais pas preview
// import { useState, useEffect } from "react";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";

// interface QuestionFormProps {
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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
//   const [position, setPosition] = useState(1);

//   const [options, setOptions] = useState<string[]>([""]);
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const [fieldErrors, setFieldErrors] = useState<{
//     label?: string;
//     options?: string;
//     scale?: string;
//   }>({});
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));
//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const validate = () => {
//     const errors: typeof fieldErrors = {};

//     if (!label.trim()) errors.label = "Le libellé de la question est requis.";

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         errors.options = "Au moins une option est requise.";
//     }

//     if (type === "SCALE") {
//       if (min > max) errors.scale = "Min ne peut pas être supérieur à Max.";
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) {
//       setToast({
//         message: "Veuillez corriger les erreurs avant de continuer",
//         type: "danger",
//       });
//       return;
//     }

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim() !== "");
//       if (type === "SINGLE_CHOICE") payload.nextMap = nextMap;
//     }

//     if (type === "SCALE") payload.config = { min, max };

//     try {
//       onSubmit(payload);
//       setToast({ message: "Question ajoutée avec succès !", type: "success" });
//       // reset
//       setLabel("");
//       setType("TEXT");
//       setPosition((prev) => prev + 1);
//       setOptions([""]);
//       setMin(1);
//       setMax(5);
//       setNextMap({});
//       setFieldErrors({});
//     } catch {
//       setToast({
//         message: "Erreur lors de l'ajout de la question",
//         type: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="p-3 border rounded mb-3"
//         style={{ background: "#f9f9f9" }}
//       >
//         <div className="mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Libellé de la question"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//           />
//           {fieldErrors.label && (
//             <div className="text-danger mt-1">{fieldErrors.label}</div>
//           )}
//         </div>

//         <div className="mb-2">
//           <select
//             className="form-select"
//             value={type}
//             onChange={(e) => setType(e.target.value as QuestionType)}
//           >
//             {QUESTION_TYPE_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {type === "SCALE" && (
//           <div className="mb-2 d-flex gap-2">
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Min"
//               value={min}
//               onChange={(e) => setMin(Number(e.target.value))}
//             />
//             <input
//               type="number"
//               className="form-control"
//               placeholder="Max"
//               value={max}
//               onChange={(e) => setMax(Number(e.target.value))}
//             />
//           </div>
//         )}
//         {fieldErrors.scale && (
//           <div className="text-danger mb-2">{fieldErrors.scale}</div>
//         )}

//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//           <div className="mb-2">
//             <label>Options :</label>
//             {options.map((opt, idx) => (
//               <div key={idx} className="input-group mb-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => removeOption(idx)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="btn btn-secondary mb-2"
//               onClick={addOption}
//             >
//               ➕ Ajouter Option
//             </button>
//             {fieldErrors.options && (
//               <div className="text-danger">{fieldErrors.options}</div>
//             )}
//           </div>
//         )}

//         {type === "SINGLE_CHOICE" &&
//           options.filter((o) => o.trim() !== "").length > 0 && (
//             <div className="mb-2">
//               <label>Condition SIMPLE (nextMap) :</label>
//               {options.map((opt) => (
//                 <div key={opt} className="input-group mb-1">
//                   <span className="input-group-text">{opt} →</span>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="ID question suivante"
//                     value={nextMap[opt] || ""}
//                     onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         {/* --- Live Preview --- */}
//         <div className="mb-3">
//           <label className="form-label">
//             <strong>Aperçu de la question :</strong>
//           </label>
//           <QuestionPreview
//             label={label || "Titre de la question"}
//             type={type}
//             options={options.filter((o) => o.trim() !== "")}
//             config={{ min, max }}
//             nextMap={nextMap}
//           />
//         </div>

//         <button type="submit" className="btn btn-primary mt-2">
//           ➕ Ajouter
//         </button>
//       </form>

//       {/* Toast */}
//       {toast && (
//         <div
//           className={`toast align-items-center text-bg-${toast.type} border-0 show`}
//           role="alert"
//           aria-live="assertive"
//           aria-atomic="true"
//           style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//             <button
//               type="button"
//               className="btn-close btn-close-white me-2 m-auto"
//               onClick={() => setToast(null)}
//             ></button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default QuestionForm;

// ================================ Bon mais pas de message de validation
// import { useState } from "react";
// import { QuestionType } from "../../types/question";

// interface QuestionFormProps {
//   onSubmit: (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//     position: number;
//   }) => void;
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
//   const [position, setPosition] = useState(1);

//   // Pour SINGLE / MULTIPLE
//   const [options, setOptions] = useState<string[]>([""]);
//   // Pour SCALE
//   const [min, setMin] = useState(1);
//   const [max, setMax] = useState(5);
//   // Pour SINGLE_CHOICE → nextMap
//   const [nextMap, setNextMap] = useState<Record<string, string>>({});

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => setOptions([...options, ""]);
//   const removeOption = (index: number) =>
//     setOptions(options.filter((_, i) => i !== index));

//   const handleNextMapChange = (option: string, target: string) => {
//     setNextMap((prev) => ({ ...prev, [option]: target }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload: any = { label, type, position };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const cleanedOptions = options.filter((o) => o.trim() !== "");
//       if (cleanedOptions.length === 0)
//         return alert("Veuillez ajouter au moins une option");
//       payload.options = cleanedOptions;
//       if (type === "SINGLE_CHOICE") {
//         payload.nextMap = nextMap;
//       }
//     }

//     if (type === "SCALE") {
//       if (min > max) return alert("Min ne peut pas être supérieur à Max");
//       payload.config = { min, max };
//     }

//     onSubmit(payload);

//     // reset
//     setLabel("");
//     setType("TEXT");
//     setPosition((prev) => prev + 1);
//     setOptions([""]);
//     setMin(1);
//     setMax(5);
//     setNextMap({});
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="p-3 border rounded mb-3"
//       style={{ background: "#f9f9f9" }}
//     >
//       <div className="mb-2">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Libellé de la question"
//           value={label}
//           onChange={(e) => setLabel(e.target.value)}
//           required
//         />
//       </div>

//       <div className="mb-2">
//         <select
//           className="form-select"
//           value={type}
//           onChange={(e) => setType(e.target.value as QuestionType)}
//         >
//           {QUESTION_TYPE_OPTIONS.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {type === "SCALE" && (
//         <div className="mb-2 d-flex gap-2">
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Min"
//             value={min}
//             onChange={(e) => setMin(Number(e.target.value))}
//           />
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Max"
//             value={max}
//             onChange={(e) => setMax(Number(e.target.value))}
//           />
//         </div>
//       )}

//       {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//         <div className="mb-2">
//           <label>Options :</label>
//           {options.map((opt, idx) => (
//             <div key={idx} className="input-group mb-1">
//               <input
//                 type="text"
//                 className="form-control"
//                 value={opt}
//                 onChange={(e) => handleOptionChange(idx, e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="btn btn-danger"
//                 onClick={() => removeOption(idx)}
//               >
//                 🗑
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="btn btn-secondary mb-2"
//             onClick={addOption}
//           >
//             ➕ Ajouter Option
//           </button>
//         </div>
//       )}

//       {type === "SINGLE_CHOICE" &&
//         options.filter((o) => o.trim() !== "").length > 0 && (
//           <div className="mb-2">
//             <label>Condition SIMPLE (nextMap) :</label>
//             {options.map((opt) => (
//               <div key={opt} className="input-group mb-1">
//                 <span className="input-group-text">{opt} →</span>
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="ID question suivante"
//                   value={nextMap[opt] || ""}
//                   onChange={(e) => handleNextMapChange(opt, e.target.value)}
//                 />
//               </div>
//             ))}
//           </div>
//         )}

//       <button type="submit" className="btn btn-primary mt-2">
//         ➕ Ajouter
//       </button>
//     </form>
//   );
// };

// export default QuestionForm;

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
