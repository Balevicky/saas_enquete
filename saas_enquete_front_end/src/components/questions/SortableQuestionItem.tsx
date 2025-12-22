// src/components/questions/SortableQuestionItem.tsx
import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "../../services/questionService";
import { QuestionType } from "../../types/question";
import QuestionPreview from "./QuestionPreview";
import { useConfirm } from "../ConfirmProvider";
import "./SortableQuestionItem.css";

interface Props {
  question: Question;
  allQuestions: Question[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Question>) => void;
  disabled?: boolean;
}

const QUESTION_TYPES: QuestionType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "SCALE",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DATE",
  "EMAIL",
  "PHONE",
];

const SortableQuestionItem: React.FC<Props> = ({
  question,
  allQuestions,
  onDelete,
  onUpdate,
  disabled,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "#e0f7fa" : "white",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [label, setLabel] = useState(question.label);
  const [type, setType] = useState<QuestionType>(question.type);
  const [options, setOptions] = useState<string[]>(question.options || []);
  const [config, setConfig] = useState(question.config);
  const [nextMap, setNextMap] = useState<Record<string, string>>(
    question.nextMap || {}
  );

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const confirm = useConfirm();

  // ======================
  // nextMap sync
  // ======================
  useEffect(() => {
    if (type !== "SINGLE_CHOICE") {
      setNextMap({});
      return;
    }
    setNextMap((prev) => {
      const cleaned: Record<string, string> = {};
      options.forEach((opt) => {
        if (opt.trim()) cleaned[opt] = prev[opt] || "";
      });
      return cleaned;
    });
  }, [options, type]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ======================
  // VALIDATION
  // ======================
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!label.trim()) newErrors.push("Le libellé est requis.");

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length === 0)
        newErrors.push("Au moins une option est requise.");

      Object.entries(nextMap).forEach(([opt, qid]) => {
        if (
          qid &&
          !allQuestions.find(
            (q) => q.id === qid && q.position > question.position
          )
        ) {
          newErrors.push(
            `L'option "${opt}" pointe vers une question invalide.`
          );
        }
      });
    }

    setErrors(newErrors);
    console.log("errors", errors);

    if (newErrors.length) {
      setToast({ message: newErrors.join(" "), type: "danger" });
      return false;
    }
    return true;
  };

  // ======================
  // SAVE
  // ======================
  const handleSave = () => {
    if (!validate()) return;

    const payload: Partial<Question> = {
      label,
      type,
      config,
      position: question.position,
    };

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      payload.options = options.filter((o) => o.trim());
    }

    if (type === "SINGLE_CHOICE") {
      const cleanedNextMap: Record<string, string> = {};
      Object.entries(nextMap).forEach(([key, value]) => {
        if (payload.options?.includes(key) && value) {
          cleanedNextMap[key] = value;
        }
      });
      payload.nextMap = cleanedNextMap;
    }

    onUpdate(question.id, payload);
    setIsEditing(false);
    setErrors([]);
    setToast({
      message: "Question sauvegardée avec succès !",
      type: "success",
    });
  };

  // ======================
  // DELETE QUESTION
  // ======================
  const handleDelete = async () => {
    const result = await confirm(
      <>
        <p>Es-tu sûr de vouloir supprimer la question :</p>
        <strong>{question.label}</strong>
        <p className="text-danger mt-2">Cette action est irréversible.</p>
      </>,
      {
        title: "Confirmer la suppression",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (result) onDelete(question.id);
  };

  // ======================
  // DELETE OPTION (🆕)
  // ======================
  const handleDeleteOption = async (opt: string, index: number) => {
    const confirmed = await confirm(
      <>
        <p>
          Supprimer l’option <strong>« {opt || "Option vide"} »</strong> ?
        </p>
        {type === "SINGLE_CHOICE" && (
          <p className="text-warning mt-2">
            ⚠️ Toute condition associée (nextMap) sera supprimée.
          </p>
        )}
      </>,
      {
        title: "Supprimer l’option",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (!confirmed) return;

    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const stopDrag = (e: React.SyntheticEvent) => e.stopPropagation();
  // ==================================
  // SUPPRESSION DE CHANGEMENT DE TYPE QUESTION EXPLE:SINGLE_CHOICE → TEXT supprime options + nextMap).
  // ==================================
  const handleTypeChange = async (newType: QuestionType) => {
    const isChoiceType = type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
    const willLoseOptions =
      isChoiceType &&
      newType !== "SINGLE_CHOICE" &&
      newType !== "MULTIPLE_CHOICE";

    if (willLoseOptions && options.filter((o) => o.trim()).length > 0) {
      const confirmed = await confirm(
        <>
          <p>
            Changer le type de la question va supprimer toutes les options
            existantes.
          </p>
          {type === "SINGLE_CHOICE" && (
            <p className="text-warning mt-2">
              ⚠️ Les conditions (nextMap) seront également supprimées.
            </p>
          )}
        </>,
        {
          title: "Changer le type de la question",
          confirmText: "Continuer",
          cancelText: "Annuler",
        }
      );

      if (!confirmed) return;
    }

    setType(newType);

    // Nettoyage volontaire des données incompatibles
    if (newType !== "SINGLE_CHOICE" && newType !== "MULTIPLE_CHOICE") {
      setOptions([]);
      setNextMap({});
    }

    if (newType === "MULTIPLE_CHOICE") {
      setNextMap({});
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="list-group-item mb-2 rounded shadow-sm"
    >
      <div className="d-flex justify-content-between align-items-start">
        {!disabled && (
          <span
            className="me-2 text-muted"
            style={{ cursor: "grab" }}
            {...attributes}
            {...listeners}
          >
            ☰
          </span>
        )}

        <div className="flex-grow-1">
          {isEditing ? (
            <>
              <input
                className="form-control mb-2"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <select
                className="form-select mb-2"
                value={type}
                // onChange={(e) => setType(e.target.value as QuestionType)}
                onChange={(e) =>
                  handleTypeChange(e.target.value as QuestionType)
                }
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
                <div className="mb-2">
                  <strong>Options</strong>
                  {options.map((opt, i) => (
                    <div key={i} className="input-group mb-1">
                      <input
                        className="form-control"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[i] = e.target.value;
                          setOptions(copy);
                        }}
                      />
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onPointerDown={stopDrag}
                        onMouseDown={stopDrag}
                        onClick={() => handleDeleteOption(opt, i)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-primary"
                    type="button"
                    onPointerDown={stopDrag}
                    onMouseDown={stopDrag}
                    onClick={() => setOptions([...options, ""])}
                  >
                    + Ajouter option
                  </button>
                </div>
              )}
              {/* =========== Condition SIMPLE============= */}

              {type === "SINGLE_CHOICE" &&
                options.filter((o) => o.trim()).length > 0 && (
                  <div className="mb-2">
                    <strong>Condition SIMPLE (nextMap)</strong>
                    {options.map((opt) => (
                      <div key={opt} className="input-group mb-1">
                        <span className="input-group-text">{opt} →</span>
                        <select
                          className="form-select"
                          value={nextMap[opt] || ""}
                          onChange={(e) =>
                            setNextMap((prev) => ({
                              ...prev,
                              [opt]: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            -- Choisir la question suivante --
                          </option>
                          {allQuestions
                            .filter(
                              (q) =>
                                q.position > question.position &&
                                q.id !== question.id
                            )
                            .map((q) => (
                              <option key={q.id} value={q.id}>
                                {q.position}. {q.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              {/* ======================== */}
              <button
                className="btn btn-sm btn-success me-2"
                onPointerDown={stopDrag}
                onMouseDown={stopDrag}
                onClick={handleSave}
              >
                💾 Sauver
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onPointerDown={stopDrag}
                onMouseDown={stopDrag}
                onClick={() => setIsEditing(false)}
              >
                ❌ Annuler
              </button>
            </>
          ) : (
            <>
              <strong>
                {question.position}. {question.label}
              </strong>
              <span className="badge bg-info ms-2">{question.type}</span>

              <button
                className="btn btn-sm btn-outline-secondary ms-2"
                onPointerDown={stopDrag}
                onMouseDown={stopDrag}
                onClick={() => setShowPreview((p) => !p)}
              >
                👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
              </button>
            </>
          )}

          {showPreview && !isEditing && (
            <div className="mt-2">
              <QuestionPreview
                label={label}
                type={type}
                options={options}
                config={config}
                nextMap={nextMap}
              />
            </div>
          )}
        </div>

        {!disabled && !isEditing && (
          <div className="btn-group btn-group-sm ms-2">
            <button
              className="btn btn-outline-primary"
              onPointerDown={stopDrag}
              onMouseDown={stopDrag}
              onClick={() => setIsEditing(true)}
            >
              ✏️
            </button>
            <button
              className="btn btn-outline-danger"
              onPointerDown={stopDrag}
              onMouseDown={stopDrag}
              onClick={handleDelete}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableQuestionItem;

// // // ========================================== BON avec suppression de question avec confirmation mais pas confirmation de supr des option 22/12/2025
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";
// import { useConfirm } from "../ConfirmProvider";
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isDragging ? "#e0f7fa" : "white",
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);

//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   const confirm = useConfirm();

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }
//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0)
//         newErrors.push("Au moins une option est requise.");

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }
//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value)
//           cleanedNextMap[key] = value;
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   const handleDelete = async () => {
//     const result = await confirm(
//       <>
//         <p>Es-tu sûr de vouloir supprimer la question :</p>
//         <strong>{question.label}</strong>
//         <p className="text-danger mt-2">Cette action est irréversible.</p>
//       </>,
//       {
//         title: "Confirmer la suppression",
//         confirmText: "Supprimer",
//         cancelText: "Annuler",
//       }
//     );

//     if (result) onDelete(question.id);
//   };

//   const stopDrag = (e: React.SyntheticEvent) => e.stopPropagation();

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         type="button"
//                         onPointerDown={stopDrag}
//                         onMouseDown={stopDrag}
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-primary"
//                     type="button"
//                     onPointerDown={stopDrag}
//                     onMouseDown={stopDrag}
//                     onClick={() => setOptions([...options, ""])}
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim()).length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter(
//                               (q) =>
//                                 q.position > question.position &&
//                                 q.id !== question.id
//                             )
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.position}. {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>

//               <button
//                 className="btn btn-sm btn-outline-secondary ms-2"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setShowPreview((p) => !p)}
//               >
//                 👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
//               </button>
//             </>
//           )}

//           {showPreview && !isEditing && (
//             <div className="mt-2">
//               <QuestionPreview
//                 label={label}
//                 type={type}
//                 options={options}
//                 config={config}
//                 nextMap={nextMap}
//               />
//             </div>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onPointerDown={stopDrag}
//               onMouseDown={stopDrag}
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onPointerDown={stopDrag}
//               onMouseDown={stopDrag}
//               onClick={handleDelete}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// // ========================================== BON mais avce suppression de question avec confirmation 22/12/2025
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isDragging ? "#e0f7fa" : "white",
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);

//   /** 🔥 MODAL SUPPRESSION */
//   const [showConfirmDelete, setShowConfirmDelete] = useState(false);

//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   const [errors, setErrors] = useState<string[]>([]);

//   /** 🔒 Empêche le drag sur boutons */
//   const stopDrag = (e: React.SyntheticEvent) => {
//     e.stopPropagation();
//   };

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0) {
//         newErrors.push("Au moins une option est requise.");
//       }

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   /** ✅ CONFIRMATION SUPPRESSION */
//   const confirmDelete = () => {
//     onDelete(question.id);
//     setShowConfirmDelete(false);
//     setToast({
//       message: "Question supprimée avec succès !",
//       type: "success",
//     });
//   };

//   return (
//     <>
//       {/* ===== ITEM ===== */}
//       <div
//         ref={setNodeRef}
//         style={style}
//         className="list-group-item mb-2 rounded shadow-sm"
//       >
//         <div className="d-flex justify-content-between align-items-start">
//           {!disabled && (
//             <span
//               className="me-2 text-muted"
//               style={{ cursor: "grab" }}
//               {...attributes}
//               {...listeners}
//             >
//               ☰
//             </span>
//           )}

//           <div className="flex-grow-1">
//             {isEditing ? (
//               <>
//                 <input
//                   className="form-control mb-2"
//                   value={label}
//                   onChange={(e) => setLabel(e.target.value)}
//                 />

//                 <select
//                   className="form-select mb-2"
//                   value={type}
//                   onChange={(e) => setType(e.target.value as QuestionType)}
//                 >
//                   {QUESTION_TYPES.map((t) => (
//                     <option key={t} value={t}>
//                       {t}
//                     </option>
//                   ))}
//                 </select>

//                 {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                   <div className="mb-2">
//                     <strong>Options</strong>
//                     {options.map((opt, i) => (
//                       <div key={i} className="input-group mb-1">
//                         <input
//                           className="form-control"
//                           value={opt}
//                           onChange={(e) => {
//                             const copy = [...options];
//                             copy[i] = e.target.value;
//                             setOptions(copy);
//                           }}
//                         />
//                         <button
//                           className="btn btn-outline-danger"
//                           type="button"
//                           onPointerDown={stopDrag}
//                           onMouseDown={stopDrag}
//                           onClick={() =>
//                             setOptions(options.filter((_, idx) => idx !== i))
//                           }
//                         >
//                           ✖
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       className="btn btn-sm btn-primary"
//                       type="button"
//                       onPointerDown={stopDrag}
//                       onMouseDown={stopDrag}
//                       onClick={() => setOptions([...options, ""])}
//                     >
//                       + Ajouter option
//                     </button>
//                   </div>
//                 )}

//                 {type === "SINGLE_CHOICE" &&
//                   options.filter((o) => o.trim()).length > 0 && (
//                     <div className="mb-2">
//                       <strong>Condition SIMPLE (nextMap)</strong>
//                       {options.map((opt) => (
//                         <div key={opt} className="input-group mb-1">
//                           <span className="input-group-text">{opt} →</span>
//                           <select
//                             className="form-select"
//                             value={nextMap[opt] || ""}
//                             onChange={(e) =>
//                               setNextMap((prev) => ({
//                                 ...prev,
//                                 [opt]: e.target.value,
//                               }))
//                             }
//                           >
//                             <option value="">
//                               -- Choisir la question suivante --
//                             </option>
//                             {allQuestions
//                               .filter(
//                                 (q) =>
//                                   q.position > question.position &&
//                                   q.id !== question.id
//                               )
//                               .map((q) => (
//                                 <option key={q.id} value={q.id}>
//                                   {q.position}. {q.label}
//                                 </option>
//                               ))}
//                           </select>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                 <button
//                   className="btn btn-sm btn-success me-2"
//                   onPointerDown={stopDrag}
//                   onMouseDown={stopDrag}
//                   onClick={handleSave}
//                 >
//                   💾 Sauver
//                 </button>
//                 <button
//                   className="btn btn-sm btn-secondary"
//                   onPointerDown={stopDrag}
//                   onMouseDown={stopDrag}
//                   onClick={() => setIsEditing(false)}
//                 >
//                   ❌ Annuler
//                 </button>
//               </>
//             ) : (
//               <>
//                 <strong>
//                   {question.position}. {question.label}
//                 </strong>
//                 <span className="badge bg-info ms-2">{question.type}</span>

//                 <button
//                   className="btn btn-sm btn-outline-secondary ms-2"
//                   onPointerDown={stopDrag}
//                   onMouseDown={stopDrag}
//                   onClick={() => setShowPreview((p) => !p)}
//                 >
//                   👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
//                 </button>
//               </>
//             )}

//             {showPreview && !isEditing && (
//               <div className="mt-2">
//                 <QuestionPreview
//                   label={label}
//                   type={type}
//                   options={options}
//                   config={config}
//                   nextMap={nextMap}
//                 />
//               </div>
//             )}
//           </div>

//           {!disabled && !isEditing && (
//             <div className="btn-group btn-group-sm ms-2">
//               <button
//                 className="btn btn-outline-primary"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setIsEditing(true)}
//               >
//                 ✏️
//               </button>
//               <button
//                 className="btn btn-outline-danger"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setShowConfirmDelete(true)}
//               >
//                 🗑️
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ===== MODAL CONFIRMATION ===== */}
//       {showConfirmDelete && (
//         <div className="modal fade show d-block" tabIndex={-1}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirmer la suppression</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowConfirmDelete(false)}
//                 />
//               </div>
//               <div className="modal-body">
//                 <p>Voulez-vous supprimer la question :</p>
//                 <strong>{question.label}</strong>
//                 <p className="text-danger mt-2">
//                   Cette action est irréversible.
//                 </p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowConfirmDelete(false)}
//                 >
//                   Annuler
//                 </button>
//                 <button className="btn btn-danger" onClick={confirmDelete}>
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* BACKDROP */}
//       {showConfirmDelete && <div className="modal-backdrop fade show" />}
//     </>
//   );
// };

// export default SortableQuestionItem;

// =============================================== BON mais avce suppression de question sans confirmation 22/12/2025
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview";
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isDragging ? "#e0f7fa" : "white",
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   /** 🔒 BLOQUE LE DRAG SUR LES BOUTONS */
//   const stopDrag = (e: React.SyntheticEvent) => {
//     e.stopPropagation();
//   };

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0) {
//         newErrors.push("Au moins une option est requise.");
//       }

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   const handleDelete = () => {
//     onDelete(question.id);
//     setToast({
//       message: "Question supprimée avec succès !",
//       type: "success",
//     });
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         type="button"
//                         onPointerDown={stopDrag}
//                         onMouseDown={stopDrag}
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-primary"
//                     type="button"
//                     onPointerDown={stopDrag}
//                     onMouseDown={stopDrag}
//                     onClick={() => setOptions([...options, ""])}
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim()).length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter(
//                               (q) =>
//                                 q.position > question.position &&
//                                 q.id !== question.id
//                             )
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.position}. {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>

//               <button
//                 className="btn btn-sm btn-outline-secondary ms-2"
//                 onPointerDown={stopDrag}
//                 onMouseDown={stopDrag}
//                 onClick={() => setShowPreview((p) => !p)}
//               >
//                 👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
//               </button>
//             </>
//           )}

//           {showPreview && !isEditing && (
//             <div className="mt-2">
//               <QuestionPreview
//                 label={label}
//                 type={type}
//                 options={options}
//                 config={config}
//                 nextMap={nextMap}
//               />
//             </div>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onPointerDown={stopDrag}
//               onMouseDown={stopDrag}
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onPointerDown={stopDrag}
//               onMouseDown={stopDrag}
//               onClick={handleDelete}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ===================== BON mais pas de suppression de question 22/12/2025
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview"; // ✅ AJOUT
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isDragging ? "#e0f7fa" : "white", // ← couleur pendant drag
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false); // ✅ AJOUT
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0)
//         newErrors.push("Au moins une option est requise.");

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   const handleDelete = () => {
//     onDelete(question.id);
//     setShowModal(false);
//     setToast({
//       message: "Question supprimée avec succès !",
//       type: "success",
//     });
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {/* {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && ( */}
//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     // className="btn btn-sm btn-outline-primary"
//                     className="btn btn-sm btn-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim()).length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter(
//                               (q) =>
//                                 q.position > question.position &&
//                                 q.id !== question.id
//                             )
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.position}. {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>

//               {/* 👁️ BOUTON APERÇU */}
//               <button
//                 className="btn btn-sm btn-outline-secondary ms-2"
//                 onClick={() => setShowPreview((p) => !p)}
//               >
//                 👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
//               </button>
//             </>
//           )}

//           {/* 👁️ PREVIEW */}
//           {showPreview && !isEditing && (
//             <div className="mt-2">
//               <QuestionPreview
//                 label={label}
//                 type={type}
//                 options={options}
//                 config={config}
//                 nextMap={nextMap}
//               />
//             </div>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;
// =====================================
// import React, { useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   index?: number;
//   disabled?: boolean;
//   onDelete?: (id: string) => void;
//   onUpdate?: (id: string, data: Partial<Question>) => void;
// }

// /** ✅ TYPES OFFICIELS */
// const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
//   { value: "TEXT", label: "Texte court" },
//   { value: "TEXTAREA", label: "Texte long" },
//   { value: "NUMBER", label: "Nombre" },
//   { value: "SCALE", label: "Échelle" },
//   { value: "SINGLE_CHOICE", label: "Choix unique" },
//   { value: "MULTIPLE_CHOICE", label: "Choix multiple" },
//   { value: "DATE", label: "Date" },
//   { value: "EMAIL", label: "Email" },
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   index,
//   disabled,
//   onDelete,
//   onUpdate,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id, disabled });

//   const [editing, setEditing] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     border: "1px solid #ddd",
//     padding: "10px",
//     borderRadius: "6px",
//     marginBottom: "8px",
//     background: "#fff",
//     display: "flex",
//     alignItems: "flex-start",
//     gap: "8px",
//   };

//   const save = () => {
//     if (!onUpdate) return;

//     onUpdate(question.id, {
//       label: label.trim(),
//       type,
//     });

//     setEditing(false);
//   };

//   const cancel = () => {
//     setLabel(question.label);
//     setType(question.type);
//     setEditing(false);
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       {/* 🟦 Drag handle */}
//       <span
//         {...attributes}
//         {...listeners}
//         className="text-muted"
//         style={{ cursor: "grab", paddingTop: 6 }}
//       >
//         ⠿
//       </span>

//       {/* 🟩 Contenu */}
//       <div className="flex-grow-1">
//         {editing ? (
//           <>
//             {/* LABEL */}
//             <input
//               className="form-control form-control-sm mb-2"
//               value={label}
//               autoFocus
//               onChange={(e) => setLabel(e.target.value)}
//               onKeyDown={(e) => e.key === "Escape" && cancel()}
//               onBlur={save}
//             />

//             {/* TYPE */}
//             <select
//               className="form-select form-select-sm"
//               value={type}
//               onChange={(e) => setType(e.target.value as QuestionType)}
//             >
//               {QUESTION_TYPES.map((t) => (
//                 <option key={t.value} value={t.value}>
//                   {t.label}
//                 </option>
//               ))}
//             </select>
//           </>
//         ) : (
//           <>
//             <div>
//               {index !== undefined && (
//                 <strong className="me-1">{index + 1}.</strong>
//               )}
//               {question.label}
//             </div>
//             <small className="text-muted">
//               {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
//             </small>
//           </>
//         )}
//       </div>

//       {/* 🟥 Actions */}
//       <div className="d-flex gap-1">
//         {!editing && onUpdate && (
//           <button
//             className="btn btn-sm btn-outline-primary"
//             onClick={() => setEditing(true)}
//           >
//             ✏️
//           </button>
//         )}
//         {onDelete && (
//           <button
//             className="btn btn-sm btn-outline-danger"
//             onClick={() => onDelete(question.id)}
//           >
//             🗑️
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ============================
// import React, { useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";

// interface Props {
//   question: Question;
//   index?: number;
//   disabled?: boolean;
//   onDelete?: (id: string) => void;
//   onUpdate?: (id: string, data: Partial<Question>) => void;
// }

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   index,
//   disabled,
//   onDelete,
//   onUpdate,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: question.id,
//       disabled,
//     });

//   const [isEditing, setIsEditing] = useState(false);
//   const [value, setValue] = useState(question.label);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     border: "1px solid #ddd",
//     padding: "8px",
//     borderRadius: "4px",
//     marginBottom: "6px",
//     backgroundColor: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     cursor: disabled ? "default" : "grab",
//   };

//   const save = () => {
//     if (!onUpdate) return;
//     if (value.trim() && value !== question.label) {
//       onUpdate(question.id, { label: value.trim() });
//     }
//     setIsEditing(false);
//   };

//   const cancel = () => {
//     setValue(question.label);
//     setIsEditing(false);
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       {/* 🔹 Drag handle */}
//       <span
//         {...attributes}
//         {...listeners}
//         className="me-2 text-muted"
//         style={{ cursor: "grab" }}
//       >
//         ⠿
//       </span>

//       {/* 🔹 Contenu */}
//       <div className="flex-grow-1 me-2">
//         {isEditing ? (
//           <input
//             className="form-control form-control-sm"
//             autoFocus
//             value={value}
//             onChange={(e) => setValue(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") save();
//               if (e.key === "Escape") cancel();
//             }}
//             onBlur={save}
//           />
//         ) : (
//           <span>
//             {index !== undefined && (
//               <strong className="me-1">{index + 1}.</strong>
//             )}
//             {question.label}
//           </span>
//         )}
//       </div>

//       {/* 🔹 Actions */}
//       <div className="d-flex gap-1">
//         {!isEditing && onUpdate && (
//           <button
//             className="btn btn-sm btn-outline-primary"
//             onClick={() => setIsEditing(true)}
//           >
//             ✏️
//           </button>
//         )}
//         {onDelete && (
//           <button
//             className="btn btn-sm btn-outline-danger"
//             onClick={() => onDelete(question.id)}
//           >
//             🗑️
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ====================================== Bon mais npas de suprresion et mise ajour
// import React from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";

// interface Props {
//   question: Question;
//   index?: number; // pour numéroter
//   disabled?: boolean;
//   onDelete?: (id: string) => void;
//   onUpdate?: (id: string, data: Partial<Question>) => void;
// }

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   index,
//   disabled,
//   onDelete,
//   onUpdate,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: question.id,
//       disabled,
//     });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     border: "1px solid #ddd",
//     padding: "8px",
//     borderRadius: "4px",
//     marginBottom: "4px",
//     backgroundColor: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     cursor: disabled ? "default" : "grab",
//   };

//   const handleEdit = () => {
//     if (!onUpdate) return;
//     const newLabel = prompt(
//       "Modifier le texte de la question :",
//       question.label
//     );
//     if (newLabel && newLabel !== question.label) {
//       onUpdate(question.id, { label: newLabel });
//     }
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <span>
//         {index !== undefined ? `${index + 1}. ` : ""}
//         {question.label}
//       </span>
//       <div>
//         {onUpdate && (
//           <button
//             className="btn btn-sm btn-outline-primary me-1"
//             onClick={handleEdit}
//           >
//             ✏️
//           </button>
//         )}
//         {onDelete && (
//           <button
//             className="btn btn-sm btn-outline-danger"
//             onClick={() => onDelete(question.id)}
//           >
//             🗑️
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ======================================

// import React from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";

// interface Props {
//   question: Question;
//   disabled?: boolean;
//   onDelete?: (id: string) => void;
//   onUpdate?: (id: string, data: Partial<Question>) => void;
// }

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   disabled,
//   onDelete,
//   onUpdate,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: question.id,
//       disabled,
//     });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     border: "1px solid #ddd",
//     padding: "8px",
//     borderRadius: "4px",
//     marginBottom: "4px",
//     backgroundColor: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     cursor: disabled ? "default" : "grab",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <span>{question.label}</span>
//       <div>
//         {onUpdate && (
//           <button
//             className="btn btn-sm btn-outline-primary me-1"
//             onClick={() => onUpdate(question.id, {})} // adapter selon ton besoin
//           >
//             ✏️
//           </button>
//         )}
//         {onDelete && (
//           <button
//             className="btn btn-sm btn-outline-danger"
//             onClick={() => onDelete(question.id)}
//           >
//             🗑️
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ============================== Bon mais pas de suppression
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import QuestionPreview from "./QuestionPreview"; // ✅ AJOUT
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isDragging ? "#e0f7fa" : "white", // ← couleur pendant drag
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false); // ✅ AJOUT
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0)
//         newErrors.push("Au moins une option est requise.");

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   const handleDelete = () => {
//     onDelete(question.id);
//     setShowModal(false);
//     setToast({
//       message: "Question supprimée avec succès !",
//       type: "success",
//     });
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {/* {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && ( */}
//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     // className="btn btn-sm btn-outline-primary"
//                     className="btn btn-sm btn-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim()).length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter(
//                               (q) =>
//                                 q.position > question.position &&
//                                 q.id !== question.id
//                             )
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.position}. {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>

//               {/* 👁️ BOUTON APERÇU */}
//               <button
//                 className="btn btn-sm btn-outline-secondary ms-2"
//                 onClick={() => setShowPreview((p) => !p)}
//               >
//                 👁️ {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
//               </button>
//             </>
//           )}

//           {/* 👁️ PREVIEW */}
//           {showPreview && !isEditing && (
//             <div className="mt-2">
//               <QuestionPreview
//                 label={label}
//                 type={type}
//                 options={options}
//                 config={config}
//                 nextMap={nextMap}
//               />
//             </div>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// // ===================================== BON avec confirmation à la supression avec css avec validation  et affiche une les questions suivantes dans le conditionnel, pas changement couleur de fond pour la question en Drag&drop
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import "./SortableQuestionItem.css";

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Auto close toast
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim());
//       if (filledOptions.length === 0)
//         newErrors.push("Au moins une option est requise.");

//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (
//           qid &&
//           !allQuestions.find(
//             (q) => q.id === qid && q.position > question.position
//           )
//         ) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position,
//     };

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       payload.options = options.filter((o) => o.trim());
//     }

//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//     setErrors([]);
//     setToast({
//       message: "Question sauvegardée avec succès !",
//       type: "success",
//     });
//   };

//   const handleDelete = () => {
//     onDelete(question.id);
//     setShowModal(false);
//     setToast({
//       message: "Question supprimée avec succès !",
//       type: "success",
//     });
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* ✅ CONDITION SIMPLE – corrigée */}
//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim()).length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter(
//                               (q) =>
//                                 q.position > question.position &&
//                                 q.id !== question.id
//                             )
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.position}. {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {errors.length > 0 && (
//                 <div className="alert alert-danger">
//                   <ul className="mb-0">
//                     {errors.map((err, i) => (
//                       <li key={i}>{err}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// // ===================================== BON avec confirmation à la supression avec css avec validation pas changement couleur de fond pour la question en Drag&drop
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import "./SortableQuestionItem.css"; // CSS fade modal

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState<string>(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);
//   const [errors, setErrors] = useState<string[]>([]);

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }
//     setNextMap((prev: Record<string, string>) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Fermeture automatique du toast après 3s
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // Validation du formulaire
//   const validate = (): boolean => {
//     const newErrors: string[] = [];

//     if (!label.trim()) newErrors.push("Le libellé de la question est requis.");

//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const filledOptions = options.filter((o) => o.trim() !== "");
//       if (filledOptions.length === 0)
//         newErrors.push("Au moins une option est requise.");
//       filledOptions.forEach((opt, idx) => {
//         if (!opt.trim()) newErrors.push(`Option ${idx + 1} est vide.`);
//       });

//       // Vérifier que nextMap ne pointe pas vers une question inexistante
//       Object.entries(nextMap).forEach(([opt, qid]) => {
//         if (qid && !allQuestions.find((q) => q.id === qid)) {
//           newErrors.push(
//             `L'option "${opt}" pointe vers une question invalide.`
//           );
//         }
//       });
//     }

//     setErrors(newErrors);

//     if (newErrors.length > 0) {
//       setToast({ message: newErrors.join(" "), type: "danger" });
//       return false;
//     }

//     return true;
//   };

//   // const handleSave = () => {
//   //   if (!validate()) return;

//   //   const payload: Partial<Question> = {
//   //     label,
//   //     type,
//   //     options,
//   //     config,
//   //     nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
//   //     position: question.position, // 🔹 ajouter ici
//   //   };

//   //   try {
//   //     onUpdate(question.id, payload);
//   //     setIsEditing(false);
//   //     setErrors([]);
//   //     setToast({
//   //       message: "Question sauvegardée avec succès !",
//   //       type: "success",
//   //     });
//   //   } catch (error) {
//   //     setToast({ message: "Erreur lors de la sauvegarde", type: "danger" });
//   //   }
//   // };
//   const handleSave = () => {
//     if (!validate()) return;

//     // Commencer avec les champs de base
//     const payload: Partial<Question> = {
//       label,
//       type,
//       config,
//       position: question.position, // 🔹 obligatoire pour le serveur
//     };

//     // Ajouter options si le type le nécessite
//     if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
//       const cleanedOptions = options.filter((o) => o.trim() !== "");
//       payload.options = cleanedOptions;
//     }

//     // Ajouter nextMap seulement pour SINGLE_CHOICE et nettoyer les clés
//     if (type === "SINGLE_CHOICE") {
//       const cleanedNextMap: Record<string, string> = {};
//       Object.entries(nextMap).forEach(([key, value]) => {
//         if (payload.options?.includes(key) && value) {
//           cleanedNextMap[key] = value;
//         }
//       });
//       payload.nextMap = cleanedNextMap;
//     }

//     try {
//       onUpdate(question.id, payload);
//       setIsEditing(false);
//       setErrors([]);
//       setToast({
//         message: "Question sauvegardée avec succès !",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({ message: "Erreur lors de la sauvegarde", type: "danger" });
//     }
//   };

//   const handleDelete = () => {
//     try {
//       onDelete(question.id);
//       setShowModal(false);
//       setToast({
//         message: "Question supprimée avec succès !",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({ message: "Erreur lors de la suppression", type: "danger" });
//     }
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev: Record<string, string>) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter((q) => q.id !== question.id)
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               {errors.length > 0 && (
//                 <div className="alert alert-danger">
//                   <ul className="mb-0">
//                     {errors.map((err, i) => (
//                       <li key={i}>{err}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//                 type="button"
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//                 type="button"
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//               type="button"
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//               type="button"
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modal confirmation */}
//       {showModal && <div className="modal-backdrop fade show"></div>}
//       {showModal && (
//         <div className="modal fade show d-block" tabIndex={-1}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirmation</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Voulez-vous vraiment supprimer cette question ?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={handleDelete}
//                 >
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

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
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ===================================================== BON avec confirmation à la supression avec css sans validation
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import "./SortableQuestionItem.css"; // CSS fade modal

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState<string>(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);

//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "danger";
//   } | null>(null);

//   // Synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }
//     setNextMap((prev: Record<string, string>) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   // Fermeture automatique du toast après 15s
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 15000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const handleSave = () => {
//     const payload: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//       nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
//     };

//     try {
//       onUpdate(question.id, payload);
//       setIsEditing(false);
//       setToast({
//         message: "Question sauvegardée avec succès !",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({ message: "Erreur lors de la sauvegarde", type: "danger" });
//     }
//   };

//   const handleDelete = () => {
//     try {
//       onDelete(question.id);
//       setShowModal(false);
//       setToast({
//         message: "Question supprimée avec succès !",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({ message: "Erreur lors de la suppression", type: "danger" });
//     }
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}
// //==========================================
//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
// //==========================================================
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev: Record<string, string>) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter((q) => q.id !== question.id)
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//                 type="button"
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//                 type="button"
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//               type="button"
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//               type="button"
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modal de confirmation avec fade */}
//       {showModal && <div className="modal-backdrop fade show"></div>}
//       {showModal && (
//         <div className="modal fade show d-block" tabIndex={-1}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirmation</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Voulez-vous vraiment supprimer cette question ?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={handleDelete}
//                 >
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

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
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ===================================================== BON avec confirmation à la supression avec css
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";
// import "./SortableQuestionItem.css"; // CSS pour le fade

// interface Props {
//   question: Question;
//   allQuestions: Question[];
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [label, setLabel] = useState<string>(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);

//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev: Record<string, string>) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   const handleSave = () => {
//     const payload: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//       nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
//     };
//     onUpdate(question.id, payload);
//     setIsEditing(false);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev: Record<string, string>) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter((q) => q.id !== question.id)
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//                 type="button"
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//                 type="button"
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//               type="button"
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)}
//               type="button"
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ✅ MODAL DE CONFIRMATION AVEC FADE */}
//       {showModal && <div className="modal-backdrop fade show"></div>}
//       {showModal && (
//         <div className="modal fade show d-block" tabIndex={-1}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirmation</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Voulez-vous vraiment supprimer cette question ?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => {
//                     onDelete(question.id);
//                     setShowModal(false);
//                   }}
//                 >
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ==================================================BON avec confirmation à la supression
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   allQuestions: Question[]; // toutes les questions pour nextMap dropdown
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false); // ✅ état modal suppression
//   const [label, setLabel] = useState<string>(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);

//   // ✅ logique conditionnelle
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   // ✅ synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev: Record<string, string>) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   const handleSave = () => {
//     const payload: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//       nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
//     };

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {/* ✅ CONDITION SIMPLE — Dropdown pour nextMap */}
//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev: Record<string, string>) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter((q) => q.id !== question.id)
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//                 type="button"
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//                 type="button"
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//               type="button"
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => setShowModal(true)} // ✅ ouvrir modal
//               type="button"
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ✅ MODAL DE CONFIRMATION */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex={-1}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirmation</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Voulez-vous vraiment supprimer cette question ?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => {
//                     onDelete(question.id);
//                     setShowModal(false);
//                   }}
//                 >
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortableQuestionItem;

// =========================================== BON mais pas confirmation à la supression
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   allQuestions: Question[]; // toutes les questions pour nextMap dropdown
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem: React.FC<Props> = ({
//   question,
//   allQuestions,
//   onDelete,
//   onUpdate,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [label, setLabel] = useState<string>(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);

//   // ✅ logique conditionnelle
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   // ✅ synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev: Record<string, string>) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   const handleSave = () => {
//     const payload: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//       nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
//     };

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                         type="button"
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                     type="button"
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {/* ✅ CONDITION SIMPLE — Dropdown pour nextMap */}
//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <select
//                           className="form-select"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev: Record<string, string>) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         >
//                           <option value="">
//                             -- Choisir la question suivante --
//                           </option>
//                           {allQuestions
//                             .filter((q) => q.id !== question.id)
//                             .map((q) => (
//                               <option key={q.id} value={q.id}>
//                                 {q.label}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//                 type="button"
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//                 type="button"
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//               type="button"
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => onDelete(question.id)}
//               type="button"
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ===================================
// import React, { useEffect, useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem = ({
//   question,
//   onDelete,
//   onUpdate,
//   disabled,
// }: Props) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);

//   // ✅ logique conditionnelle
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   // ✅ synchroniser nextMap quand options changent
//   useEffect(() => {
//     if (type !== "SINGLE_CHOICE") {
//       setNextMap({});
//       return;
//     }

//     setNextMap((prev) => {
//       const cleaned: Record<string, string> = {};
//       options.forEach((opt) => {
//         if (opt.trim()) cleaned[opt] = prev[opt] || "";
//       });
//       return cleaned;
//     });
//   }, [options, type]);

//   const handleSave = () => {
//     const payload: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//     };

//     if (type === "SINGLE_CHOICE") {
//       payload.nextMap = nextMap;
//     }

//     if (type !== "SINGLE_CHOICE") {
//       payload.nextMap = {};
//     }
//     console.log(" payload", payload);

//     onUpdate(question.id, payload);
//     setIsEditing(false);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {/* ✅ CONDITION SIMPLE — IDENTIQUE À QuestionForm */}
//               {type === "SINGLE_CHOICE" &&
//                 options.filter((o) => o.trim() !== "").length > 0 && (
//                   <div className="mb-2">
//                     <strong>Condition SIMPLE (nextMap)</strong>
//                     {options.map((opt) => (
//                       <div key={opt} className="input-group mb-1">
//                         <span className="input-group-text">{opt} →</span>
//                         <input
//                           className="form-control"
//                           placeholder="ID question suivante"
//                           value={nextMap[opt] || ""}
//                           onChange={(e) =>
//                             setNextMap((prev) => ({
//                               ...prev,
//                               [opt]: e.target.value,
//                             }))
//                           }
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => onDelete(question.id)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ================================== Bom mais pas de logique conditionnelle
// import React, { useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem = ({
//   question,
//   onDelete,
//   onUpdate,
//   disabled,
// }: Props) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   const handleSave = () => {
//     onUpdate(question.id, {
//       label,
//       type,
//       options,
//       config,
//       nextMap,
//     });
//     setIsEditing(false);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         {/* ================= DRAG HANDLE ================= */}
//         {!disabled && (
//           <span
//             className="me-2 text-muted"
//             style={{ cursor: "grab" }}
//             {...attributes}
//             {...listeners}
//           >
//             ☰
//           </span>
//         )}

//         {/* ================= CONTENT ================= */}
//         <div className="flex-grow-1">
//           {isEditing ? (
//             <>
//               <input
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />

//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {/* {QUESTION_TYPES.map((t) => ( */}
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => {
//                           const copy = [...options];
//                           copy[i] = e.target.value;
//                           setOptions(copy);
//                         }}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() =>
//                           setOptions(options.filter((_, idx) => idx !== i))
//                         }
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setOptions([...options, ""])}
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {type === "SCALE" && (
//                 <div className="d-flex gap-2 mb-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.min ?? 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max ?? 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={config?.max ?? 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min ?? 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               <button
//                 className="btn btn-sm btn-success me-2"
//                 onClick={handleSave}
//               >
//                 💾 Sauver
//               </button>
//               <button
//                 className="btn btn-sm btn-secondary"
//                 onClick={() => setIsEditing(false)}
//               >
//                 ❌ Annuler
//               </button>
//             </>
//           ) : (
//             <>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>
//               <span className="badge bg-info ms-2">{question.type}</span>
//             </>
//           )}
//         </div>

//         {/* ================= ACTIONS ================= */}
//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => onDelete(question.id)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ======================================
// import React, { useState } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   onUpdate: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// const QUESTION_TYPES: QuestionType[] = [
//   "TEXT",
//   "TEXTAREA",
//   "NUMBER",
//   "SCALE",
//   "SINGLE_CHOICE",
//   "MULTIPLE_CHOICE",
//   "DATE",
//   "EMAIL",
//   "PHONE",
// ];

// const SortableQuestionItem = ({
//   question,
//   onDelete,
//   onUpdate,
//   disabled,
// }: Props) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     cursor: disabled ? "default" : "grab",
//   };

//   const [isEditing, setIsEditing] = useState(false);
//   const [label, setLabel] = useState(question.label);
//   const [type, setType] = useState<QuestionType>(question.type);
//   const [options, setOptions] = useState<string[]>(question.options || []);
//   const [config, setConfig] = useState<
//     { min: number; max: number } | undefined
//   >(question.config);
//   const [nextMap, setNextMap] = useState<Record<string, string>>(
//     question.nextMap || {}
//   );

//   const handleSave = () => {
//     const updateData: Partial<Question> = {
//       label,
//       type,
//       options,
//       config,
//       nextMap,
//     };
//     onUpdate(question.id, updateData);
//     setIsEditing(false);
//   };

//   const handleAddOption = () => setOptions([...options, ""]);

//   const handleOptionChange = (idx: number, value: string) => {
//     const newOpts = [...options];
//     newOpts[idx] = value;
//     setOptions(newOpts);
//   };

//   const handleRemoveOption = (idx: number) => {
//     const newOpts = options.filter((_, i) => i !== idx);
//     setOptions(newOpts);
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="list-group-item mb-2 rounded shadow-sm"
//       {...attributes}
//       {...listeners}
//     >
//       <div className="d-flex justify-content-between align-items-start">
//         <div className="flex-grow-1">
//           {isEditing ? (
//             <div>
//               <input
//                 type="text"
//                 className="form-control mb-2"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//               />
//               <select
//                 className="form-select mb-2"
//                 value={type}
//                 onChange={(e) => setType(e.target.value as QuestionType)}
//               >
//                 {QUESTION_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {/* Options pour SINGLE / MULTIPLE_CHOICE */}
//               {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
//                 <div className="mb-2">
//                   <strong>Options:</strong>
//                   {options.map((opt, i) => (
//                     <div key={i} className="input-group mb-1">
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={opt}
//                         onChange={(e) => handleOptionChange(i, e.target.value)}
//                       />
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={() => handleRemoveOption(i)}
//                       >
//                         ✖️
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={handleAddOption}
//                   >
//                     + Ajouter option
//                   </button>
//                 </div>
//               )}

//               {/* Config pour SCALE */}
//               {type === "SCALE" && (
//                 <div className="mb-2 d-flex gap-2">
//                   <input
//                     type="number"
//                     className="form-control"
//                     placeholder="Min"
//                     value={config?.min || 1}
//                     onChange={(e) =>
//                       setConfig({
//                         min: Number(e.target.value),
//                         max: config?.max || 5,
//                       })
//                     }
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     placeholder="Max"
//                     value={config?.max || 5}
//                     onChange={(e) =>
//                       setConfig({
//                         min: config?.min || 1,
//                         max: Number(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//               )}

//               {/* Boutons Sauver / Annuler */}
//               <div className="mt-2">
//                 <button
//                   className="btn btn-sm btn-success me-2"
//                   onClick={handleSave}
//                 >
//                   💾 Sauver
//                 </button>
//                 <button
//                   className="btn btn-sm btn-secondary"
//                   onClick={() => setIsEditing(false)}
//                 >
//                   ❌ Annuler
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <strong>
//                 {question.position}. {question.label}
//               </strong>{" "}
//               <span className="badge bg-info ms-2">{question.type}</span>
//               {/* Affichage options/config/nextMap */}
//               {options && options.length > 0 && (
//                 <div className="mt-1">
//                   <strong>Options:</strong>{" "}
//                   {options.map((o, i) => (
//                     <span key={i} className="badge bg-secondary me-1">
//                       {o}
//                     </span>
//                   ))}
//                 </div>
//               )}
//               {config && (
//                 <div className="mt-1">
//                   <strong>Échelle:</strong> {config.min} à {config.max}
//                 </div>
//               )}
//               {nextMap && Object.keys(nextMap).length > 0 && (
//                 <div className="mt-1">
//                   <strong>Condition SIMPLE:</strong>
//                   <ul className="mb-0">
//                     {Object.entries(nextMap).map(([a, qId]) => (
//                       <li key={a}>
//                         Si <code>{a}</code> → {qId}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {!disabled && !isEditing && (
//           <div className="btn-group btn-group-sm ms-2">
//             <button
//               className="btn btn-outline-primary"
//               onClick={() => setIsEditing(true)}
//             >
//               ✏️
//             </button>
//             <button
//               className="btn btn-outline-danger"
//               onClick={() => onDelete(question.id)}
//             >
//               🗑️
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ========================================= pas bon
// import { CSS } from "@dnd-kit/utilities";
// import { useSortable } from "@dnd-kit/sortable";
// import { Question } from "../../services/questionService";
// import React, { ReactNode } from "react";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   disabled?: boolean;
//   renderExtra?: (q: Question) => ReactNode;
// }

// const SortableQuestionItem = ({
//   question,
//   onDelete,
//   disabled,
//   renderExtra,
// }: Props) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: 12,
//     marginBottom: 8,
//     border: "1px solid #ddd",
//     borderRadius: 4,
//     background: isDragging ? "#f5f2ecff" : "#fff", // ← couleur de drag
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.2)" : "none", // optionnel : un peu de relief
//     cursor: isDragging ? "grabbing" : "grab", // visuel du curseur
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <span>
//         {question.position}. {question.label} ({question.type})
//       </span>
//       <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//         {renderExtra && renderExtra(question)}
//         {!disabled && <button onClick={() => onDelete(question.id)}>❌</button>}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;

// ============================ Bon mais pas de changement couleur lors Drag&drop
// import { CSS } from "@dnd-kit/utilities";
// import { useSortable } from "@dnd-kit/sortable";
// import { Question } from "../../services/questionService";
// import React, { ReactNode } from "react";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   disabled?: boolean;
//   renderExtra?: (q: Question) => ReactNode;
// }

// const SortableQuestionItem = ({
//   question,
//   onDelete,
//   disabled,
//   renderExtra,
// }: Props) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: question.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: 12,
//     marginBottom: 8,
//     border: "1px solid #ddd",
//     borderRadius: 4,
//     background: "#fff",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <span>
//         {question.position}. {question.label} ({question.type})
//       </span>
//       <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//         {renderExtra && renderExtra(question)}
//         {!disabled && <button onClick={() => onDelete(question.id)}>❌</button>}
//       </div>
//     </div>
//   );
// };

// export default SortableQuestionItem;
