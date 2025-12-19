import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "../../services/questionService";
import { QuestionType } from "../../types/question";

interface Props {
  question: Question;
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

const SortableQuestionItem = ({
  question,
  onDelete,
  onUpdate,
  disabled,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(question.label);
  const [type, setType] = useState<QuestionType>(question.type);
  const [options, setOptions] = useState<string[]>(question.options || []);
  const [config, setConfig] = useState<
    { min: number; max: number } | undefined
  >(question.config);

  // ✅ logique conditionnelle
  const [nextMap, setNextMap] = useState<Record<string, string>>(
    question.nextMap || {}
  );

  // ✅ synchroniser nextMap quand options changent
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

  const handleSave = () => {
    const payload: Partial<Question> = {
      label,
      type,
      options,
      config,
    };

    if (type === "SINGLE_CHOICE") {
      payload.nextMap = nextMap;
    }

    if (type !== "SINGLE_CHOICE") {
      payload.nextMap = {};
    }
    console.log(" payload", payload);

    onUpdate(question.id, payload);
    setIsEditing(false);
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
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setOptions([...options, ""])}
                  >
                    + Ajouter option
                  </button>
                </div>
              )}

              {/* ✅ CONDITION SIMPLE — IDENTIQUE À QuestionForm */}
              {type === "SINGLE_CHOICE" &&
                options.filter((o) => o.trim() !== "").length > 0 && (
                  <div className="mb-2">
                    <strong>Condition SIMPLE (nextMap)</strong>
                    {options.map((opt) => (
                      <div key={opt} className="input-group mb-1">
                        <span className="input-group-text">{opt} →</span>
                        <input
                          className="form-control"
                          placeholder="ID question suivante"
                          value={nextMap[opt] || ""}
                          onChange={(e) =>
                            setNextMap((prev) => ({
                              ...prev,
                              [opt]: e.target.value,
                            }))
                          }
                        />
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

              <button
                className="btn btn-sm btn-success me-2"
                onClick={handleSave}
              >
                💾 Sauver
              </button>
              <button
                className="btn btn-sm btn-secondary"
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
            </>
          )}
        </div>

        {!disabled && !isEditing && (
          <div className="btn-group btn-group-sm ms-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsEditing(true)}
            >
              ✏️
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => onDelete(question.id)}
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
