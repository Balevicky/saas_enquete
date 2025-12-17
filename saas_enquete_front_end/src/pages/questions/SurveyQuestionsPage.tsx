import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import questionService, { Question } from "../../services/questionService";
import surveyService, { Survey } from "../../services/surveyService";
import QuestionForm from "../../components/questions/QuestionForm";
import { QuestionType } from "../../types/question";

const SurveyQuestionsPage = () => {
  const navigate = useNavigate();
  const { tenantSlug, surveyId } = useParams<{
    tenantSlug: string;
    surveyId: string;
  }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdvanced = survey?.mode === "ADVANCED";

  // ======================
  // LOAD SURVEY + QUESTIONS
  // ======================
  const load = async () => {
    if (!tenantSlug || !surveyId) return;

    setLoading(true);
    try {
      const [surveyRes, questionsRes] = await Promise.all([
        surveyService.get(tenantSlug, surveyId),
        questionService.list(tenantSlug, surveyId),
      ]);

      setSurvey(surveyRes);
      setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug, surveyId]);

  // ======================
  // CREATE / DELETE QUESTION
  // ======================
  const createQuestion = async (data: {
    label: string;
    type: QuestionType;
  }) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    await questionService.create(tenantSlug, surveyId, {
      label: data.label,
      type: data.type,
      position: questions.length + 1,
    });

    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    await questionService.remove(tenantSlug, surveyId, id);
    load();
  };

  // ======================
  // DRAG & DROP
  // ======================
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !tenantSlug || !surveyId) return;
    if (isAdvanced) return;

    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updated = reordered.map((q, index) => ({
      ...q,
      position: index + 1,
    }));
    setQuestions(updated);

    // Persist order to server
    for (const q of updated) {
      await questionService.update(tenantSlug, surveyId, q.id, {
        position: q.position,
      });
    }
  };

  if (loading) return <p>Chargement des questions...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>🧩 Questions du survey</h2>

      {isAdvanced && (
        <div
          style={{
            padding: 16,
            border: "1px solid #f5c2c7",
            background: "#f8d7da",
            marginBottom: 20,
          }}
        >
          <strong>🚫 Mode avancé activé</strong>
          <p style={{ marginTop: 8 }}>
            Les questions sont gérées via le <b>Survey Builder</b>.
          </p>
          <button
            onClick={() =>
              navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
            }
          >
            Ouvrir le Survey Builder
          </button>
        </div>
      )}

      {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

      {/* 📋 DRAG & DROP QUESTIONS */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions-droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {questions.map((q, index) => (
                <Draggable
                  key={q.id}
                  draggableId={q.id}
                  index={index}
                  // isDragDisabled={!!isAdvanced}
                >
                  {(providedDraggable, snapshot) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        background: snapshot.isDragging ? "#e6f7ff" : "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        ...providedDraggable.draggableProps.style,
                      }}
                    >
                      <span>
                        {q.position}. {q.label} ({q.type})
                      </span>
                      {!isAdvanced && (
                        <button onClick={() => deleteQuestion(q.id)}>❌</button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SurveyQuestionsPage;

// =======================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
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

//   // Détection du mode ADVANCED
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
//   // CREATE QUESTION
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

//   // ======================
//   // DELETE QUESTION
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   // ======================
//   // DRAG & DROP
//   // ======================
//   const handleDragEnd = async (result: DropResult) => {
//     if (!result.destination) return; // abandon du drag

//     const items = Array.from(questions);
//     const [reordered] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reordered);

//     // Réassigner les positions
//     const updatedQuestions = items.map((q, idx) => ({
//       ...q,
//       position: idx + 1,
//     }));
//     setQuestions(updatedQuestions);

//     // Sauvegarde des positions sur le backend
//     if (tenantSlug && surveyId) {
//       await Promise.all(
//         updatedQuestions.map((q) =>
//           questionService.update(tenantSlug, surveyId, q.id, {
//             position: q.position,
//           })
//         )
//       );
//     }
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {/* Mode ADVANCED */}
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

//       {/* Formulaire (mode SIMPLE) */}
//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* Liste de questions avec Drag & Drop */}
//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable droppableId="questions-droppable">
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//               <QuestionList
//                 questions={questions}
//                 onDelete={deleteQuestion}
//                 // disabled={isAdvanced}
//                 disabled={!!isAdvanced} // <- toujours true ou false
//               />
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
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";
// // import questionService, {
// //   Question,
// //   QuestionType,
// // } from "../../services/questionService";
// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ DÉTECTION DU MODE (PLACEMENT CORRECT)
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
//       setQuestions(questionsRes.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // CREATE QUESTION (SIMPLE MODE ONLY)
//   // ======================
//   // const createQuestion = async (data: { label: string; type: string }) => {
//   //   if (!tenantSlug || !surveyId || isAdvanced) return;

//   //   await questionService.create(tenantSlug, surveyId, {
//   //     ...data,
//   //     position: questions.length + 1,
//   //   });

//   //   load();
//   // };
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

//   // ======================
//   // DELETE QUESTION
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {/* 🚫 MODE ADVANCED : BLOCAGE UI */}
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

//       {/* ✅ FORMULAIRE QUESTIONS (SIMPLE ONLY) */}
//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* 📋 LISTE QUESTIONS */}
//       <QuestionList
//         questions={questions}
//         onDelete={deleteQuestion}
//         onReorder={async (updatedQuestions) => {
//           setQuestions(updatedQuestions);
//           // sauvegarde backend
//           for (const q of updatedQuestions) {
//             await questionService.update(tenantSlug!, surveyId!, q.id, {
//               position: q.position,
//             });
//           }
//         }}
//         disabled={isAdvanced}
//       />
//       {/* <QuestionList
//         questions={questions}
//         onDelete={deleteQuestion}
//         disabled={isAdvanced}
//       /> */}
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// =============================================
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import questionService, { Question } from "../../services/questionService";

// // ✅ nouveaux composants
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";
// // import { QuestionType } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService"; //nouveau
// const SurveyQuestionsPage = () => {
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [survey, setSurvey] = useState<Survey | null>(null); //nouveau

//   const isAdvanced = survey?.mode === "ADVANCED";
//   // ======================
//   // LOAD QUESTIONS
//   // ======================
//   // const load = () => {
//   //   if (!tenantSlug || !surveyId) return;

//   //   setLoading(true);
//   //   questionService
//   //     .list(tenantSlug, surveyId)
//   //     .then((res) => setQuestions(res.data))
//   //     .finally(() => setLoading(false));
//   // };
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;

//     setLoading(true);

//     try {
//       const [surveyRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId),
//       ]);

//       setSurvey(surveyRes);
//       setQuestions(questionsRes.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // CREATE QUESTION
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//   }) => {
//     if (!tenantSlug || !surveyId) return;

//     await questionService.create(tenantSlug, surveyId, {
//       ...data,
//       position: questions.length + 1,
//     });

//     load();
//   };

//   // ======================
//   // DELETE QUESTION
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId) return;
//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {/* ✅ FORMULAIRE MODULAIRE */}
//       <QuestionForm onSubmit={createQuestion} />

//       {/* ✅ LISTE MODULAIRE */}
//       <QuestionList questions={questions} onDelete={deleteQuestion} />
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ======================================/
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import questionService, { Question } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// const QUESTION_TYPE_OPTIONS: {
//   label: string;
//   value: QuestionType;
// }[] = [
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

// const SurveyQuestionsPage = () => {
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");
//   const [loading, setLoading] = useState(true);

//   const load = () => {
//     if (!tenantSlug || !surveyId) return;

//     setLoading(true);
//     questionService
//       .list(tenantSlug, surveyId)
//       .then((res) => setQuestions(res.data))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   const createQuestion = async () => {
//     if (!tenantSlug || !surveyId || !label) return;

//     await questionService.create(tenantSlug, surveyId, {
//       label,
//       type,
//       position: questions.length + 1,
//     });

//     setLabel("");
//     setType("TEXT");
//     load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId) return;
//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       <div
//         style={{
//           margin: "20px 0",
//           padding: 16,
//           border: "1px solid #ddd",
//         }}
//       >
//         <h4>➕ Ajouter une question</h4>

//         <input
//           placeholder="Libellé de la question"
//           value={label}
//           onChange={(e) => setLabel(e.target.value)}
//         />

//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value as QuestionType)}
//         >
//           {QUESTION_TYPE_OPTIONS.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>

//         <button onClick={createQuestion}>Ajouter</button>
//       </div>

//       {questions.length === 0 && <p>Aucune question définie.</p>}

//       <ul>
//         {questions.map((q) => (
//           <li key={q.id} style={{ marginBottom: 8 }}>
//             <strong>
//               {q.position}. {q.label}
//             </strong>{" "}
//             ({q.type})
//             <button
//               style={{ marginLeft: 10 }}
//               onClick={() => deleteQuestion(q.id)}
//             >
//               ❌
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// =============================================
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import questionService, {
//   Question,
//   // QuestionType,
// } from "../../services/questionService";
// import { QuestionType } from "../../types/question";

// const SurveyQuestionsPage = () => {
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [label, setLabel] = useState("");
//   const [type, setType] = useState<QuestionType>("TEXT");
//   const [loading, setLoading] = useState(true);
//   let surveyIdMo = "123";
//   const load = () => {
//     if (!tenantSlug || !surveyId) return;
//     console.log("slug ", tenantSlug);

//     if (!tenantSlug) return;
//     setLoading(true);
//     questionService
//       .list(tenantSlug, surveyId)
//       // .list(slug, surveyIdMo)
//       .then((res) => setQuestions(res.data))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     load();
//     // setLoading(false);
//   }, [tenantSlug, surveyId]);

//   const createQuestion = async () => {
//     if (!tenantSlug || !surveyId || !label) return;

//     await questionService.create(tenantSlug, surveyId, {
//       label,
//       type,
//       position: questions.length + 1,
//     });

//     setLabel("");
//     setType("TEXT");
//     load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId) return;
//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       <div
//         style={{
//           margin: "20px 0",
//           padding: 16,
//           border: "1px solid #ddd",
//         }}
//       >
//         <h4>➕ Ajouter une question</h4>
//         <input
//           placeholder="Libellé de la question"
//           value={label}
//           onChange={(e) => setLabel(e.target.value)}
//         />
//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value as QuestionType)}
//         >
//           <option value="TEXT">Texte</option>
//           <option value="NUMBER">Nombre</option>
//           <option value="SELECT">Choix</option>
//           <option value="BOOLEAN">Oui / Non</option>
//         </select>
//         <button onClick={createQuestion}>Ajouter</button>
//       </div>

//       {questions.length === 0 && <p>Aucune question définie.</p>}

//       <ul>
//         {questions.map((q) => (
//           <li key={q.id} style={{ marginBottom: 8 }}>
//             <strong>
//               {q.position}. {q.label}
//             </strong>{" "}
//             ({q.type})
//             <button
//               style={{ marginLeft: 10 }}
//               onClick={() => deleteQuestion(q.id)}
//             >
//               ❌
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;
