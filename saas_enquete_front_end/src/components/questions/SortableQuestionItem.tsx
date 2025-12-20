// ===================================== BON avec confirmation à la supression avec css avec validation pas changement couleur de fond pour la question en Drag&drop
import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "../../services/questionService";
import { QuestionType } from "../../types/question";
import "./SortableQuestionItem.css"; // CSS fade modal

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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState<string>(question.label);
  const [type, setType] = useState<QuestionType>(question.type);
  const [options, setOptions] = useState<string[]>(question.options || []);
  const [config, setConfig] = useState<
    { min: number; max: number } | undefined
  >(question.config);
  const [nextMap, setNextMap] = useState<Record<string, string>>(
    question.nextMap || {}
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Synchroniser nextMap quand options changent
  useEffect(() => {
    if (type !== "SINGLE_CHOICE") {
      setNextMap({});
      return;
    }
    setNextMap((prev: Record<string, string>) => {
      const cleaned: Record<string, string> = {};
      options.forEach((opt) => {
        if (opt.trim()) cleaned[opt] = prev[opt] || "";
      });
      return cleaned;
    });
  }, [options, type]);

  // Fermeture automatique du toast après 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Validation du formulaire
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!label.trim()) newErrors.push("Le libellé de la question est requis.");

    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      const filledOptions = options.filter((o) => o.trim() !== "");
      if (filledOptions.length === 0)
        newErrors.push("Au moins une option est requise.");
      filledOptions.forEach((opt, idx) => {
        if (!opt.trim()) newErrors.push(`Option ${idx + 1} est vide.`);
      });

      // Vérifier que nextMap ne pointe pas vers une question inexistante
      Object.entries(nextMap).forEach(([opt, qid]) => {
        if (qid && !allQuestions.find((q) => q.id === qid)) {
          newErrors.push(
            `L'option "${opt}" pointe vers une question invalide.`
          );
        }
      });
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
      setToast({ message: newErrors.join(" "), type: "danger" });
      return false;
    }

    return true;
  };

  // const handleSave = () => {
  //   if (!validate()) return;

  //   const payload: Partial<Question> = {
  //     label,
  //     type,
  //     options,
  //     config,
  //     nextMap: type === "SINGLE_CHOICE" ? nextMap : {},
  //     position: question.position, // 🔹 ajouter ici
  //   };

  //   try {
  //     onUpdate(question.id, payload);
  //     setIsEditing(false);
  //     setErrors([]);
  //     setToast({
  //       message: "Question sauvegardée avec succès !",
  //       type: "success",
  //     });
  //   } catch (error) {
  //     setToast({ message: "Erreur lors de la sauvegarde", type: "danger" });
  //   }
  // };
  const handleSave = () => {
    if (!validate()) return;

    // Commencer avec les champs de base
    const payload: Partial<Question> = {
      label,
      type,
      config,
      position: question.position, // 🔹 obligatoire pour le serveur
    };

    // Ajouter options si le type le nécessite
    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      const cleanedOptions = options.filter((o) => o.trim() !== "");
      payload.options = cleanedOptions;
    }

    // Ajouter nextMap seulement pour SINGLE_CHOICE et nettoyer les clés
    if (type === "SINGLE_CHOICE") {
      const cleanedNextMap: Record<string, string> = {};
      Object.entries(nextMap).forEach(([key, value]) => {
        if (payload.options?.includes(key) && value) {
          cleanedNextMap[key] = value;
        }
      });
      payload.nextMap = cleanedNextMap;
    }

    try {
      onUpdate(question.id, payload);
      setIsEditing(false);
      setErrors([]);
      setToast({
        message: "Question sauvegardée avec succès !",
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Erreur lors de la sauvegarde", type: "danger" });
    }
  };

  const handleDelete = () => {
    try {
      onDelete(question.id);
      setShowModal(false);
      setToast({
        message: "Question supprimée avec succès !",
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Erreur lors de la suppression", type: "danger" });
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
                onChange={(e) => setType(e.target.value as QuestionType)}
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
                        onClick={() =>
                          setOptions(options.filter((_, idx) => idx !== i))
                        }
                        type="button"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setOptions([...options, ""])}
                    type="button"
                  >
                    + Ajouter option
                  </button>
                </div>
              )}

              {type === "SINGLE_CHOICE" &&
                options.filter((o) => o.trim() !== "").length > 0 && (
                  <div className="mb-2">
                    <strong>Condition SIMPLE (nextMap)</strong>
                    {options.map((opt) => (
                      <div key={opt} className="input-group mb-1">
                        <span className="input-group-text">{opt} →</span>
                        <select
                          className="form-select"
                          value={nextMap[opt] || ""}
                          onChange={(e) =>
                            setNextMap((prev: Record<string, string>) => ({
                              ...prev,
                              [opt]: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            -- Choisir la question suivante --
                          </option>
                          {allQuestions
                            .filter((q) => q.id !== question.id)
                            .map((q) => (
                              <option key={q.id} value={q.id}>
                                {q.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

              {type === "SCALE" && (
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="number"
                    className="form-control"
                    value={config?.min ?? 1}
                    onChange={(e) =>
                      setConfig({
                        min: Number(e.target.value),
                        max: config?.max ?? 5,
                      })
                    }
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={config?.max ?? 5}
                    onChange={(e) =>
                      setConfig({
                        min: config?.min ?? 1,
                        max: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              {errors.length > 0 && (
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="btn btn-sm btn-success me-2"
                onClick={handleSave}
                type="button"
              >
                💾 Sauver
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setIsEditing(false)}
                type="button"
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
            </>
          )}
        </div>

        {!disabled && !isEditing && (
          <div className="btn-group btn-group-sm ms-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              ✏️
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => setShowModal(true)}
              type="button"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Modal confirmation */}
      {showModal && <div className="modal-backdrop fade show"></div>}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Voulez-vous vraiment supprimer cette question ?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
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
    </div>
  );
};

export default SortableQuestionItem;

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
