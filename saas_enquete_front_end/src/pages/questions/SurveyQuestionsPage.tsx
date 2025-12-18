import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import questionService, { Question } from "../../services/questionService";
import surveyService, { Survey } from "../../services/surveyService";
import QuestionForm from "../../components/questions/QuestionForm";
import QuestionList from "../../components/questions/QuestionList";
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

      // Trier par position
      const sorted = questionsRes.data.sort((a, b) => a.position - b.position);
      setQuestions(sorted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug, surveyId]);

  // ======================
  // CREATE QUESTION
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

  // ======================
  // DELETE QUESTION
  // ======================
  const deleteQuestion = async (id: string) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    await questionService.remove(tenantSlug, surveyId, id);
    load();
  };

  // ======================
  // DRAG END
  // ======================
  const handleDragEnd = async (event: DragEndEvent) => {
    if (isAdvanced) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    const reordered = arrayMove(questions, oldIndex, newIndex).map(
      (q, idx) => ({
        ...q,
        position: idx + 1,
      })
    );

    setQuestions(reordered);

    // Persist
    for (const q of reordered) {
      await questionService.update(tenantSlug!, surveyId!, q.id, {
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
            background: "#f8d7da",
            border: "1px solid #f5c2c7",
            marginBottom: 20,
          }}
        >
          <strong>🚫 Mode avancé</strong>
          <p>Les questions sont gérées via le Survey Builder</p>
          <button
            onClick={() =>
              navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
            }
          >
            Ouvrir le Builder
          </button>
        </div>
      )}

      {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <QuestionList
            questions={questions}
            onDelete={deleteQuestion}
            disabled={isAdvanced}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SurveyQuestionsPage;

// ============================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const QUESTIONS_PER_PAGE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD
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

//       const sorted = questionsRes.data.sort((a, b) => a.position - b.position);
//       setQuestions(sorted);
//       setTotalPages(Math.ceil(sorted.length / QUESTIONS_PER_PAGE));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // CREATE
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
//   // DELETE
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   // ======================
//   // DRAG END (inter-pages)
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = questions.findIndex((q) => q.id === active.id);
//     const newIndex = questions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, idx) => ({
//         ...q,
//         position: idx + 1,
//       })
//     );

//     setQuestions(reordered);
//     setTotalPages(Math.ceil(reordered.length / QUESTIONS_PER_PAGE));

//     // Persist
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   if (loading) return <p>Chargement des questions...</p>;

//   // Questions de la page courante
//   const pageQuestions = questions.slice(
//     (currentPage - 1) * QUESTIONS_PER_PAGE,
//     currentPage * QUESTIONS_PER_PAGE
//   );

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={pageQuestions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={pageQuestions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* Pagination */}
//       <div style={{ marginTop: 20 }}>
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//         >
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {currentPage} / {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ==============================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const QUESTIONS_PER_PAGE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questionsByPage, setQuestionsByPage] = useState<
//     Record<number, Question[]>
//   >({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
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

//       // Trier et paginer
//       const sorted = questionsRes.data.sort((a, b) => a.position - b.position);
//       const pages: Record<number, Question[]> = {};
//       for (let i = 0; i < sorted.length; i++) {
//         const page = Math.floor(i / QUESTIONS_PER_PAGE) + 1;
//         if (!pages[page]) pages[page] = [];
//         pages[page].push(sorted[i]);
//       }

//       setQuestionsByPage(pages);
//       setTotalPages(Object.keys(pages).length);
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
//       position: Object.values(questionsByPage).flat().length + 1,
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
//   // DRAG END (vertical)
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const pageQuestions = questionsByPage[currentPage] || [];
//     const oldIndex = pageQuestions.findIndex((q) => q.id === active.id);
//     const newIndex = pageQuestions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(pageQuestions, oldIndex, newIndex).map(
//       (q, idx) => ({
//         ...q,
//         position: (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })
//     );

//     setQuestionsByPage((prev) => ({ ...prev, [currentPage]: reordered }));

//     // Persist
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   // ======================
//   // MOVE QUESTION TO ANOTHER PAGE
//   // ======================
//   const moveQuestionToPage = async (questionId: string, targetPage: number) => {
//     const oldPageQuestions = [...(questionsByPage[currentPage] || [])];
//     const question = oldPageQuestions.find((q) => q.id === questionId);
//     if (!question) return;

//     const newOldPageQuestions = oldPageQuestions.filter(
//       (q) => q.id !== questionId
//     );
//     const newTargetPageQuestions = [
//       ...(questionsByPage[targetPage] || []),
//       question,
//     ];

//     const updatedPages: Record<number, Question[]> = {
//       ...questionsByPage,
//       [currentPage]: newOldPageQuestions.map((q, idx) => ({
//         ...q,
//         position: (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })),
//       [targetPage]: newTargetPageQuestions.map((q, idx) => ({
//         ...q,
//         position: (targetPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })),
//     };

//     setQuestionsByPage(updatedPages);

//     // Persist
//     for (const q of [
//       ...updatedPages[currentPage],
//       ...updatedPages[targetPage],
//     ]) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
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
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={(questionsByPage[currentPage] || []).map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={questionsByPage[currentPage] || []}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//             renderExtra={(q: Question) => (
//               <select
//                 value={currentPage}
//                 onChange={(e) =>
//                   moveQuestionToPage(q.id, Number(e.target.value))
//                 }
//               >
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (p) => (
//                     <option key={p} value={p}>
//                       Page {p}
//                     </option>
//                   )
//                 )}
//               </select>
//             )}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* Pagination */}
//       <div style={{ marginTop: 20 }}>
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//         >
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {currentPage} / {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// =================================== PAS TROP BON
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const QUESTIONS_PER_PAGE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questionsByPage, setQuestionsByPage] = useState<
//     Record<number, Question[]>
//   >({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
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

//       // Trier et paginer
//       const sorted = questionsRes.data.sort((a, b) => a.position - b.position);
//       const pages: Record<number, Question[]> = {};
//       for (let i = 0; i < sorted.length; i++) {
//         const page = Math.floor(i / QUESTIONS_PER_PAGE) + 1;
//         if (!pages[page]) pages[page] = [];
//         pages[page].push(sorted[i]);
//       }

//       setQuestionsByPage(pages);
//       setTotalPages(Object.keys(pages).length);
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
//       position: Object.values(questionsByPage).flat().length + 1,
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
//   // DRAG END
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const pageQuestions = questionsByPage[currentPage] || [];
//     const oldIndex = pageQuestions.findIndex((q) => q.id === active.id);
//     const newIndex = pageQuestions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(pageQuestions, oldIndex, newIndex).map(
//       (q, idx) => ({
//         ...q,
//         position: (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })
//     );

//     setQuestionsByPage((prev) => ({ ...prev, [currentPage]: reordered }));

//     // Persist
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   // ======================
//   // MOVE QUESTION TO ANOTHER PAGE
//   // ======================
//   const moveQuestionToPage = async (questionId: string, targetPage: number) => {
//     const oldPageQuestions = [...(questionsByPage[currentPage] || [])];
//     const question = oldPageQuestions.find((q) => q.id === questionId);
//     if (!question) return;

//     const newOldPageQuestions = oldPageQuestions.filter(
//       (q) => q.id !== questionId
//     );
//     const newTargetPageQuestions = [
//       ...(questionsByPage[targetPage] || []),
//       question,
//     ];

//     const updatedPages: Record<number, Question[]> = {
//       ...questionsByPage,
//       [currentPage]: newOldPageQuestions.map((q, idx) => ({
//         ...q,
//         position: (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })),
//       [targetPage]: newTargetPageQuestions.map((q, idx) => ({
//         ...q,
//         position: (targetPage - 1) * QUESTIONS_PER_PAGE + idx + 1,
//       })),
//     };

//     setQuestionsByPage(updatedPages);

//     // Persist
//     for (const q of [
//       ...updatedPages[currentPage],
//       ...updatedPages[targetPage],
//     ]) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
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
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={(questionsByPage[currentPage] || []).map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={questionsByPage[currentPage] || []}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//             renderExtra={(q) => (
//               <select
//                 value={currentPage}
//                 onChange={(e) =>
//                   moveQuestionToPage(q.id, Number(e.target.value))
//                 }
//               >
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (p) => (
//                     <option key={p} value={p}>
//                       Page {p}
//                     </option>
//                   )
//                 )}
//               </select>
//             )}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* Pagination */}
//       <div style={{ marginTop: 20 }}>
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//         >
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {currentPage} / {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ======================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
//   DragStartEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const PAGE_SIZE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activeId, setActiveId] = useState<string | null>(null);

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
//   // CREATE
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
//   // DELETE
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   // ======================
//   // DRAG HANDLERS
//   // ======================
//   const handleDragStart = (event: DragStartEvent) => {
//     setActiveId(String(event.active.id));
//   };

//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = questions.findIndex((q) => q.id === String(active.id));
//     const newIndex = questions.findIndex((q) => q.id === String(over.id));

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, index) => ({ ...q, position: index + 1 })
//     );

//     setQuestions(reordered);

//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   // ======================
//   // PAGINATION
//   // ======================
//   const totalPages = Math.ceil(questions.length / PAGE_SIZE);
//   const pagedQuestions = questions.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   const goToPage = (page: number) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//   };

//   // ======================
//   // MOVE QUESTION TO ANOTHER PAGE
//   // ======================
//   const moveQuestionToPage = async (questionId: string, targetPage: number) => {
//     if (!tenantSlug || !surveyId || targetPage < 1 || targetPage > totalPages)
//       return;

//     const startIndex = (targetPage - 1) * PAGE_SIZE;
//     await questionService.update(tenantSlug, surveyId, questionId, {
//       position: startIndex + 1,
//     });

//     load();
//     setCurrentPage(targetPage);
//   };

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       <DndContext
//         collisionDetection={closestCenter}
//         onDragStart={handleDragStart}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext
//           items={pagedQuestions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={pagedQuestions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//             renderExtra={(q: Question) => (
//               <select
//                 value={currentPage}
//                 onChange={(e) =>
//                   moveQuestionToPage(q.id, Number(e.target.value))
//                 }
//               >
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (p) => (
//                     <option key={p} value={p}>
//                       Déplacer vers page {p}
//                     </option>
//                   )
//                 )}
//               </select>
//             )}
//           />
//         </SortableContext>
//       </DndContext>

//       {totalPages > 1 && (
//         <div style={{ marginTop: 16 }}>
//           <button
//             disabled={currentPage === 1}
//             onClick={() => goToPage(currentPage - 1)}
//           >
//             ◀ Page précédente
//           </button>
//           <span style={{ margin: "0 8px" }}>
//             Page {currentPage} / {totalPages}
//           </span>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => goToPage(currentPage + 1)}
//           >
//             Page suivante ▶
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ==================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const PAGE_SIZE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD PAGE
//   // ======================
//   const loadPage = async (pageNumber: number) => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       const [surveyRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId, {
//           page: pageNumber,
//           perPage: PAGE_SIZE,
//         }),
//       ]);

//       setSurvey(surveyRes);
//       setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
//       setTotal(questionsRes.meta.total);
//       setPage(pageNumber);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPage(1);
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
//       position: total + 1, // position globale
//     });

//     loadPage(page); // recharge la page courante
//   };

//   // ======================
//   // DELETE QUESTION
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     loadPage(page);
//   };

//   // ======================
//   // DRAG & DROP (page courante seulement)
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = questions.findIndex((q) => q.id === active.id);
//     const newIndex = questions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, idx) => ({ ...q, position: (page - 1) * PAGE_SIZE + idx + 1 })
//     );

//     setQuestions(reordered);

//     // 🔐 persist order pour cette page seulement
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   const totalPages = Math.ceil(total / PAGE_SIZE);

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={questions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* PAGINATION */}
//       <div style={{ marginTop: 20 }}>
//         <button disabled={page === 1} onClick={() => loadPage(page - 1)}>
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {page} / {totalPages}
//         </span>
//         <button
//           disabled={page === totalPages}
//           onClick={() => loadPage(page + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// =================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
//   DragOverEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const PAGE_SIZE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD SURVEY + QUESTIONS (all)
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       const surveyRes = await surveyService.get(tenantSlug, surveyId);
//       setSurvey(surveyRes);

//       // Charge **toutes les questions** pour Drag multi-pages
//       const questionsRes = await questionService.list(tenantSlug, surveyId, {
//         page: 1,
//         perPage: 1000, // grand nombre pour tout récupérer
//       });

//       const sorted = questionsRes.data.sort((a, b) => a.position - b.position);
//       setQuestions(sorted);
//       setTotal(sorted.length);
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
//       position: total + 1, // position globale
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
//   // DRAG & DROP MULTI-PAGES
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = questions.findIndex((q) => q.id === active.id);
//     const newIndex = questions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, idx) => ({ ...q, position: idx + 1 })
//     );

//     setQuestions(reordered);

//     // 🔐 persist order
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   // ======================
//   // Pagination (sur l'affichage seulement)
//   // ======================
//   const pagedQuestions = questions.slice(
//     (page - 1) * PAGE_SIZE,
//     page * PAGE_SIZE
//   );
//   const totalPages = Math.ceil(total / PAGE_SIZE);

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* 🔢 DnD multi-pages */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={pagedQuestions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={pagedQuestions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* PAGINATION */}
//       <div style={{ marginTop: 20 }}>
//         <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {page} / {totalPages}
//         </span>
//         <button
//           disabled={page === totalPages}
//           onClick={() => setPage(page + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ======================================== Bon avec pagination et drag&drop sur une seule page
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
//   DragOverEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import QuestionList from "../../components/questions/QuestionList";
// import { QuestionType } from "../../types/question";

// const PAGE_SIZE = 5;

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD SURVEY + QUESTIONS
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       const surveyRes = await surveyService.get(tenantSlug, surveyId);
//       setSurvey(surveyRes);

//       const questionsRes = await questionService.list(tenantSlug, surveyId, {
//         page,
//         perPage: PAGE_SIZE,
//       });

//       setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
//       setTotal(questionsRes.meta.total);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId, page]);

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
//       position: total + 1, // position globale
//     });

//     setPage(Math.ceil((total + 1) / PAGE_SIZE));
//     load();
//   };

//   // ======================
//   // DELETE QUESTION
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     if (questions.length === 1 && page > 1) setPage(page - 1);
//     else load();
//   };

//   // ======================
//   // DRAG & DROP MULTI-PAGES
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = questions.findIndex((q) => q.id === active.id);
//     const newIndex = questions.findIndex((q) => q.id === over.id);

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, idx) => ({
//         ...q,
//         position: (page - 1) * PAGE_SIZE + idx + 1, // position globale
//       })
//     );

//     setQuestions(reordered);

//     // 🔐 persist global order
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   const totalPages = Math.ceil(total / PAGE_SIZE);

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div
//           style={{
//             padding: 16,
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* 🔢 DnD multi-page */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={questions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* PAGINATION */}
//       <div style={{ marginTop: 20 }}>
//         <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {page} / {totalPages}
//         </span>
//         <button
//           disabled={page === totalPages}
//           onClick={() => setPage(page + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ================================= Bon avec pagination mais drag&dop uniqument sur la meme page
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

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

//   // Pagination
//   const [page, setPage] = useState(1);
//   const perPage = 10;

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

//   // Questions visibles sur la page actuelle
//   const visibleQuestions = questions
//     .sort((a, b) => a.position - b.position)
//     .slice((page - 1) * perPage, page * perPage);

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
//   // DRAG & DROP (page seulement)
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = visibleQuestions.findIndex((q) => q.id === active.id);
//     const newIndex = visibleQuestions.findIndex((q) => q.id === over.id);

//     if (oldIndex === -1 || newIndex === -1) return;

//     const reorderedVisible = arrayMove(
//       visibleQuestions,
//       oldIndex,
//       newIndex
//     ).map((q, index) => ({
//       ...q,
//       position: (page - 1) * perPage + index + 1,
//     }));

//     const newQuestions = [...questions];
//     for (let i = 0; i < reorderedVisible.length; i++) {
//       const idx = newQuestions.findIndex(
//         (q) => q.id === reorderedVisible[i].id
//       );
//       if (idx !== -1) newQuestions[idx] = reorderedVisible[i];
//     }

//     setQuestions(newQuestions);

//     // Persist order
//     for (const q of reorderedVisible) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
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
//             background: "#f8d7da",
//             border: "1px solid #f5c2c7",
//             marginBottom: 20,
//           }}
//         >
//           <strong>🚫 Mode avancé</strong>
//           <p>Les questions sont gérées via le Survey Builder</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* Drag & Drop */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={visibleQuestions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <QuestionList
//             questions={visibleQuestions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* Pagination */}
//       <div style={{ marginTop: 20 }}>
//         <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//           ◀ Précédent
//         </button>
//         <span style={{ margin: "0 10px" }}>
//           Page {page} / {Math.ceil(questions.length / perPage)}
//         </span>
//         <button
//           disabled={page * perPage >= questions.length}
//           onClick={() => setPage(page + 1)}
//         >
//           Suivant ▶
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ============================================BON SANS PAGINATION
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import { QuestionType } from "../../types/question";
// import QuestionList from "../../components/questions/QuestionList";

// /* ======================
//    Sortable Item
// ====================== */
// const SortableQuestionItem = ({
//   question,
//   disabled,
//   onDelete,
// }: {
//   question: Question;
//   disabled: boolean;
//   onDelete: (id: string) => void;
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: question.id,
//       disabled,
//     });

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
//     cursor: disabled ? "not-allowed" : "grab",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <span>
//         {question.position}. {question.label} ({question.type})
//       </span>
//       {!disabled && <button onClick={() => onDelete(question.id)}>❌</button>}
//     </div>
//   );
// };

// /* ======================
//    Page
// ====================== */
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

//   /* ======================
//      Load survey + questions
//   ====================== */
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

//   /* ======================
//      CRUD
//   ====================== */
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

//   /* ======================
//      Drag end
//   ====================== */
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (!event.over || isAdvanced) return;

//     const oldIndex = questions.findIndex((q) => q.id === event.active.id);
//     const newIndex = questions.findIndex((q) => q.id === event.over?.id);

//     if (oldIndex === newIndex) return;

//     const reordered = arrayMove(questions, oldIndex, newIndex).map(
//       (q, index) => ({ ...q, position: index + 1 })
//     );

//     setQuestions(reordered);

//     // persist positions
//     for (const q of reordered) {
//       await questionService.update(tenantSlug!, surveyId!, q.id, {
//         position: q.position,
//       });
//     }
//   };

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>🧩 Questions du survey</h2>

//       {/* ADVANCED MODE */}
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
//           <p>Les questions sont gérées par le Survey Builder.</p>
//           <button
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && <QuestionForm onSubmit={createQuestion} />}

//       {/* DND KIT */}
//       <DndContext
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//         measuring={{
//           droppable: {
//             strategy: "Always" as any,
//           },
//         }}
//       >
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           {/* {questions.map((q) => (
//             <SortableQuestionItem
//               key={q.id}
//               question={q}
//               disabled={!!isAdvanced}
//               onDelete={deleteQuestion}
//             />
//           ))} */}
//           <QuestionList
//             questions={questions}
//             onDelete={deleteQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ==================================================
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
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
//                   // isDragDisabled={!!isAdvanced}
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
