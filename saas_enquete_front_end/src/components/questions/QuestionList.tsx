import React from "react";
import { Question } from "../../services/questionService";

interface Props {
  questions: Question[];
  onDelete: (id: string) => void;
  disabled?: boolean;
  renderExtra?: (q: Question) => JSX.Element; // ✅ optionnel
}

const QuestionList: React.FC<Props> = ({
  questions,
  onDelete,
  disabled = false,
  renderExtra,
}) => {
  return (
    <div>
      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            padding: 12,
            marginBottom: 8,
            border: "1px solid #ddd",
            borderRadius: 4,
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {q.position}. {q.label} ({q.type})
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {renderExtra && renderExtra(q)}
            {!disabled && (
              <button
                onClick={() => onDelete(q.id)}
                style={{ cursor: "pointer" }}
              >
                ❌
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;

// =====================================
// import { Question } from "../../services/questionService";
// import QuestionItem from "./QuestionItem";

// interface Props {
//   questions: Question[];
//   onDelete: (id: string) => void;
//   disabled?: boolean;
// }

// const QuestionList = ({ questions, onDelete, disabled }: Props) => {
//   return (
//     <div>
//       {questions.map((q) => (
//         <QuestionItem
//           key={q.id}
//           question={q}
//           onDelete={onDelete}
//           disabled={disabled}
//         />
//       ))}
//     </div>
//   );
// };

// export default QuestionList;

// ==================================
// src/components/questions/QuestionList.tsx
// import { Question } from "../../services/questionService";

// interface Props {
//   questions: Question[];
//   onDelete: (id: string) => void;
//   disabled?: boolean;
// }

// const QuestionList = ({ questions, onDelete, disabled }: Props) => {
//   return (
//     <div>
//       {questions.map((q) => (
//         <div
//           key={q.id}
//           style={{
//             padding: 12,
//             marginBottom: 8,
//             border: "1px solid #ddd",
//             borderRadius: 4,
//             background: "#fff",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <span>
//             {q.position}. {q.label} ({q.type})
//           </span>

//           {!disabled && <button onClick={() => onDelete(q.id)}>❌</button>}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default QuestionList;

// ============================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "react-beautiful-dnd";
// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import { QuestionType } from "../../types/question";

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD SURVEY + QUESTIONS
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;

//     setLoading(true);
//     try {
//       const [surveyRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId),
//       ]);

//       setSurvey(surveyRes);
//       setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // CREATE / DELETE QUESTION
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//   }) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.create(tenantSlug, surveyId, {
//       label: data.label,
//       type: data.type,
//       position: questions.length + 1,
//     });

//     load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   // ======================
//   // DRAG & DROP
//   // ======================
//   const handleDragEnd = async (result: DropResult) => {
//     if (!result.destination || !tenantSlug || !surveyId) return;
//     if (isAdvanced) return;

//     const reordered = Array.from(questions);
//     const [removed] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, removed);

//     const updated = reordered.map((q, index) => ({
//       ...q,
//       position: index + 1,
//     }));
//     setQuestions(updated);

//     // Persist order to server
//     for (const q of updated) {
//       await questionService.update(tenantSlug, surveyId, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             border: "1px solid #f5c2c7",
//             background: "#f8d7da",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé activé</strong>
//           <p style={{ marginTop: 8 }}>
//             Les questions sont gérées via le <b>Survey Builder</b>.
//           </p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Survey Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* 📋 DRAG & DROP QUESTIONS */}
//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable droppableId="questions-droppable">
//           {(provided) => (
//             <div ref={provided.innerRef} {...provided.droppableProps}>
//               {questions.map((q, index) => (
//                 <Draggable
//                   key={q.id}
//                   draggableId={q.id}
//                   index={index}
//                   isDragDisabled={!!isAdvanced}
//                 >
//                   {(providedDraggable, snapshot) => (
//                     <div
//                       ref={providedDraggable.innerRef}
//                       {...providedDraggable.draggableProps}
//                       {...providedDraggable.dragHandleProps}
//                       style={{
//                         padding: 12,
//                         marginBottom: 8,
//                         border: "1px solid #ddd",
//                         borderRadius: 4,
//                         background: snapshot.isDragging ? "#e6f7ff" : "#fff",
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         ...providedDraggable.draggableProps.style,
//                       }}
//                     >
//                       <span>
//                         {q.position}. {q.label} ({q.type})
//                       </span>
//                       {!isAdvanced && (
//                         <button onClick={() => deleteQuestion(q.id)}>❌</button>
//                       )}
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ======================================
// import React from "react";
// import { Draggable } from "react-beautiful-dnd";
// import { Question } from "../../services/questionService";
// import QuestionItem from "./QuestionItem";

// interface QuestionListProps {
//   questions: Question[];
//   onDelete: (id: string) => void;
//   disabled?: boolean;
// }

// const QuestionList: React.FC<QuestionListProps> = ({
//   questions,
//   onDelete,
//   disabled = false,
// }) => {
//   return (
//     <div>
//       {questions.map((q, index) => (
//         <Draggable
//           key={q.id}
//           draggableId={q.id}
//           index={index}
//           // isDragDisabled={disabled}
//           isDragDisabled={!!disabled} // <- assure un booléen
//         >
//           {(provided, snapshot) => (
//             <div
//               ref={provided.innerRef}
//               {...provided.draggableProps}
//               {...provided.dragHandleProps}
//               style={{
//                 ...provided.draggableProps.style,
//                 opacity: snapshot.isDragging ? 0.8 : 1,
//                 marginBottom: 8,
//               }}
//             >
//               <QuestionItem
//                 question={q}
//                 onDelete={onDelete}
//                 disabled={disabled}
//               />
//             </div>
//           )}
//         </Draggable>
//       ))}
//     </div>
//   );
// };

// export default QuestionList;

// =============================================
// import { Question } from "../../services/questionService";
// import QuestionItem from "./QuestionItem";
// import React from "react";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "react-beautiful-dnd";
// // import { Question } from "../../services/questionService";

// interface QuestionListProps {
//   questions: Question[];
//   onDelete: (id: string) => void;
//   onReorder?: (updated: Question[]) => void;
//   disabled?: boolean;
// }

// const QuestionList: React.FC<QuestionListProps> = ({
//   questions,
//   onDelete,
//   onReorder,
//   disabled = false,
// }) => {
//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return; // abandon du drag

//     const items = Array.from(questions);
//     const [reordered] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reordered);

//     setQuestions(items); // update state
//   };

//   // const handleDragEnd = (result: DropResult) => {
//   //   if (!result.destination || disabled) return;

//   //   const reordered = Array.from(questions);
//   //   const [moved] = reordered.splice(result.source.index, 1);
//   //   reordered.splice(result.destination.index, 0, moved);

//   //   // Mise à jour des positions
//   //   const updatedQuestions = reordered.map((q, index) => ({
//   //     ...q,
//   //     position: index + 1,
//   //   }));

//   //   if (onReorder) onReorder(updatedQuestions);
//   // };

//   return (
//     <DragDropContext onDragEnd={handleDragEnd}>
//       <Droppable droppableId="questions">
//         {(provided) => (
//           <ul
//             {...provided.droppableProps}
//             ref={provided.innerRef}
//             style={{ padding: 0 }}
//           >
//             {questions.map((q, index) => (
//               <Draggable key={q.id} draggableId={q.id} index={index}>
//                 {(provided, snapshot) => (
//                   <li
//                     ref={provided.innerRef}
//                     {...provided.draggableProps}
//                     {...provided.dragHandleProps}
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       padding: 12,
//                       marginBottom: 8,
//                       border: "1px solid #ddd",
//                       background: snapshot.isDragging ? "#e9ecef" : "#fff",
//                       opacity: disabled ? 0.6 : 1,
//                       cursor: disabled ? "default" : "grab",
//                       ...provided.draggableProps.style,
//                     }}
//                   >
//                     <span>
//                       {q.position}. {q.label} ({q.type})
//                     </span>
//                     {!disabled && (
//                       <button onClick={() => onDelete(q.id)}>❌</button>
//                     )}
//                   </li>
//                 )}
//               </Draggable>
//             ))}
//             {provided.placeholder}
//           </ul>
//         )}
//       </Droppable>
//     </DragDropContext>
//   );
// };

// export default QuestionList;

// ======================================
// interface Props {
//   questions: Question[];
//   onDelete: (id: string) => void;
//   disabled?: boolean; // ✅ AJOUT
// }

// const QuestionList = ({ questions, onDelete }: Props) => {
//   if (questions.length === 0) {
//     return <p>Aucune question définie.</p>;
//   }

//   return (
//     <ul>
//       {questions.map((q) => (
//         <QuestionItem key={q.id} question={q} onDelete={onDelete} />
//       ))}
//     </ul>
//   );
// };

// export default QuestionList;
