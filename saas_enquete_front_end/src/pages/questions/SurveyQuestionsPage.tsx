import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import questionService, { Question } from "../../services/questionService";
import surveyService, { Survey } from "../../services/surveyService";
import QuestionForm from "../../components/questions/QuestionForm";
import SectionBlock from "../../components/sections/SectionBlock";
import { QuestionType } from "../../types/question";
import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";
import sectionService, { Section } from "../../services/sectionService";

const SurveyQuestionsPage = () => {
  const navigate = useNavigate();
  const { tenantSlug, surveyId } = useParams<{
    tenantSlug: string;
    surveyId: string;
  }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const isAdvanced = survey?.mode === "ADVANCED";

  // ======================
  // LOAD
  // ======================
  const load = async () => {
    if (!tenantSlug || !surveyId) return;
    setLoading(true);

    try {
      const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
        surveyService.get(tenantSlug, surveyId),
        sectionService.list(tenantSlug, surveyId),
        questionService.list(tenantSlug, surveyId),
      ]);

      setSurvey(surveyRes);
      setSections([...sectionsRes].sort((a, b) => a.position - b.position));
      setQuestions(
        [...questionsRes.data].sort((a, b) => a.position - b.position)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug, surveyId]);

  // ======================
  // DERIVED DATA
  // ======================
  const questionsBySection = useMemo(() => {
    const map: Record<string, Question[]> = {};

    sections.forEach((s) => (map[s.id] = []));
    map["__unassigned__"] = [];

    questions.forEach((q) => {
      if (q.sectionId && map[q.sectionId]) map[q.sectionId].push(q);
      else map["__unassigned__"].push(q);
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.position - b.position)
    );

    return map;
  }, [sections, questions]);

  // ======================
  // CREATE / UPDATE / DELETE
  // ======================
  const createQuestion = async (data: {
    label: string;
    type: QuestionType;
    options?: string[];
    config?: { min: number; max: number };
    nextMap?: Record<string, string>;
  }) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    await questionService.create(tenantSlug, surveyId, {
      ...data,
      sectionId: selectedSectionId,
      position: questions.length + 1,
    });

    load();
    setSelectedSectionId(null);
  };

  const updateQuestion = async (id: string, data: Partial<Question>) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;
    await questionService.update(tenantSlug, surveyId, id, data);
    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    await questionService.remove(tenantSlug, surveyId, id);

    const res = await questionService.list(tenantSlug, surveyId);
    const reordered = [...res.data]
      .sort((a, b) => a.position - b.position)
      .map((q, index) => ({ ...q, position: index + 1 }));

    for (const q of reordered) {
      await questionService.update(tenantSlug, surveyId, q.id, {
        position: q.position,
      });
    }

    setQuestions(reordered);
  };

  // ======================
  // DRAG & DROP
  // ======================
  // const handleDragEnd = async (event: DragEndEvent) => {
  //   if (isAdvanced) return;

  //   const { active, over } = event;
  //   if (!over || active.id === over.id) return;

  //   const movedQuestion = questions.find((q) => q.id === active.id);
  //   const targetQuestion = questions.find((q) => q.id === over.id);

  //   if (!movedQuestion || !targetQuestion) return;

  //   try {
  //     await questionService.reorder(
  //       tenantSlug!,
  //       surveyId!,
  //       movedQuestion.id,
  //       movedQuestion.sectionId ?? null,
  //       targetQuestion.sectionId ?? null,
  //       targetQuestion.position
  //     );

  //     await load();
  //   } catch (e) {
  //     console.error("Erreur reorder question", e);
  //   }
  // };
  const handleDragEnd = async (event: DragEndEvent) => {
    if (isAdvanced) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 🟢 1️⃣ Update UI immédiatement
    const reordered = arrayMove(questions, oldIndex, newIndex).map(
      (q, index) => ({
        ...q,
        position: index + 1,
      })
    );

    setQuestions(reordered);

    // 🟡 2️⃣ Sync backend (sans reload)
    try {
      await questionService.reorder(
        tenantSlug!,
        surveyId!,
        active.id as string,
        questions[oldIndex].sectionId ?? null,
        questions[newIndex].sectionId ?? null,
        newIndex + 1
      );
    } catch (e) {
      console.error("Reorder échoué → rollback", e);
      // 🔴 rollback sécurité
      setQuestions(questions);
    }
  };

  if (loading) return <p className="p-3">Chargement des questions…</p>;

  return (
    <div className="p-3">
      <h2 className="mb-3">🧩 Questions du survey</h2>

      {isAdvanced && (
        <div className="alert alert-danger">
          <strong>🚫 Mode avancé</strong>
          <p className="mb-2">
            Les questions sont gérées via le Survey Builder
          </p>
          <button
            className="btn btn-light"
            onClick={() =>
              navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
            }
          >
            Ouvrir le Builder
          </button>
        </div>
      )}

      {!isAdvanced && (
        <div className="mb-3">
          <label className="form-label">
            <strong>📂 Section de la question</strong>
          </label>
          <select
            className="form-select"
            value={selectedSectionId ?? ""}
            onChange={(e) => setSelectedSectionId(e.target.value || null)}
          >
            <option value="">🗂️ Aucune section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isAdvanced && (
        <div className="mb-4">
          <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
        </div>
      )}

      {/* ===================== DRAG & DROP ===================== */}
      {/* <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              questions={questionsBySection[section.id] || []}
              onDeleteQuestion={deleteQuestion}
              onUpdateQuestion={updateQuestion}
              disabled={isAdvanced}
            />
          ))}

          <SectionBlock
            section={null}
            questions={questionsBySection["__unassigned__"] || []}
            onDeleteQuestion={deleteQuestion}
            onUpdateQuestion={updateQuestion}
            disabled={isAdvanced}
          />
        </SortableContext>
      </DndContext> */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              questions={questionsBySection[section.id] || []}
              onDeleteQuestion={deleteQuestion}
              onUpdateQuestion={updateQuestion}
              disabled={isAdvanced}
            />
          ))}

          <SectionBlock
            section={null}
            questions={questionsBySection["__unassigned__"] || []}
            onDeleteQuestion={deleteQuestion}
            onUpdateQuestion={updateQuestion}
            disabled={isAdvanced}
          />
        </SortableContext>
      </DndContext>

      <h4 className="mt-4">🔗 Dépendances entre questions</h4>
      <div
        className="border rounded p-2"
        style={{ height: 500, background: "#fafafa" }}
      >
        <QuestionDependencyGraph questions={questions} />
      </div>
    </div>
  );
};

export default SurveyQuestionsPage;

// =======================
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
// import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";
// // ================ nouveau avec section
// import { useMemo } from "react";
// import sectionService, { Section } from "../../services/sectionService";
// import SectionBlock from "../../components/sections/SectionBlock";
// // ================ FIN nouveau avec section

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   // ================Nouveau
//   const [sections, setSections] = useState<Section[]>([]);
//   const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
//     null
//   );

//   // ================Nouveau
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       // ================= Nouveau avec section
//       const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         sectionService.list(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId),
//       ]);

//       setSurvey(surveyRes);

//       setSections([...sectionsRes].sort((a, b) => a.position - b.position));

//       setQuestions(
//         [...questionsRes.data].sort((a, b) => a.position - b.position)
//       );

//       // ================= Nouveau avec section
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   /* --------- DERIVED DATA ----------------- */
//   const questionsBySection = useMemo(() => {
//     const map: Record<string, Question[]> = {};

//     // Sections existantes
//     sections.forEach((s) => {
//       map[s.id] = [];
//     });

//     // Questions sans section
//     map["__unassigned__"] = [];

//     questions.forEach((q) => {
//       if (q.sectionId && map[q.sectionId]) {
//         map[q.sectionId].push(q);
//       } else {
//         map["__unassigned__"].push(q);
//       }
//     });
//     // Tri par position
//     Object.values(map).forEach((list) =>
//       list.sort((a, b) => a.position - b.position)
//     );

//     return map;
//   }, [sections, questions]);

//   /* --------- FIN DERIVED DATA ----------------- */

//   // ======================
//   // CREATE
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//   }) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     // await questionService.create(tenantSlug, surveyId, {
//     //   ...data,
//     //   position: questions.length + 1,
//     // });
//     await questionService.create(tenantSlug, surveyId, {
//       ...data,
//       sectionId: selectedSectionId,
//       position: questions.length + 1,
//     });

//     load();
//     setSelectedSectionId(null);
//   };

//   // ======================
//   // UPDATE
//   // ======================
//   const updateQuestion = async (id: string, data: Partial<Question>) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.update(tenantSlug, surveyId, id, data);
//     load();
//   };

//   // ======================
//   // DELETE
//   // ======================
//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     // 1️⃣ Supprimer la question
//     await questionService.remove(tenantSlug, surveyId, id);

//     // 2️⃣ Recharger les questions
//     const res = await questionService.list(tenantSlug, surveyId);

//     // 3️⃣ Recalculer les positions
//     const reordered = [...res.data]
//       .sort((a, b) => a.position - b.position)
//       .map((q, index) => ({
//         ...q,
//         position: index + 1,
//       }));

//     // 4️⃣ Mettre à jour les positions en base
//     for (const q of reordered) {
//       await questionService.update(tenantSlug, surveyId, q.id, {
//         position: q.position,
//       });
//     }

//     // 5️⃣ Mettre à jour le state
//     setQuestions(reordered);
//   };

//   // ======================
//   // DRAG & DROP
//   // ======================
//   // ==================== Nouveau avec section
//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   // Question déplacée
//   //   const movedQuestion = questions.find((q) => q.id === active.id);
//   //   if (!movedQuestion) return;

//   //   // Question cible
//   //   const targetQuestion = questions.find((q) => q.id === over.id);
//   //   if (!targetQuestion) return;

//   //   const sourceSectionId = movedQuestion.sectionId ?? null;
//   //   const targetSectionId = targetQuestion.sectionId ?? null;
//   //   const targetPosition = targetQuestion.position;

//   //   try {
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       movedQuestion.id,
//   //       sourceSectionId,
//   //       targetSectionId,
//   //       targetPosition
//   //     );

//   //     // 🔄 Recharger proprement depuis le backend
//   //     await load();
//   //   } catch (err) {
//   //     console.error("Erreur lors du reorder", err);
//   //   }
//   // };
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     /** ============================
//      *  🟦 DRAG SECTION
//      *  ============================
//      */
//     if (
//       typeof active.id === "string" &&
//       typeof over.id === "string" &&
//       active.id.startsWith("section-") &&
//       over.id.startsWith("section-")
//     ) {
//       const activeSectionId = active.id.replace("section-", "");
//       const overSectionId = over.id.replace("section-", "");

//       const activeSection = sections.find((s) => s.id === activeSectionId);
//       const overSection = sections.find((s) => s.id === overSectionId);

//       if (!activeSection || !overSection) return;

//       try {
//         await sectionService.reorder(
//           tenantSlug!,
//           surveyId!,
//           activeSection.id,
//           overSection.position
//         );

//         await load();
//       } catch (e) {
//         console.error("Erreur reorder section", e);
//       }

//       return;
//     }

//     /** ============================
//      *  🟩 DRAG QUESTION (existant)
//      *  ============================
//      */
//     const movedQuestion = questions.find((q) => q.id === active.id);
//     const targetQuestion = questions.find((q) => q.id === over.id);
//     if (!movedQuestion || !targetQuestion) return;

//     try {
//       await questionService.reorder(
//         tenantSlug!,
//         surveyId!,
//         movedQuestion.id,
//         movedQuestion.sectionId ?? null,
//         targetQuestion.sectionId ?? null,
//         targetQuestion.position
//       );

//       await load();
//     } catch (e) {
//       console.error("Erreur reorder question", e);
//     }
//   };

//   // ==================== Nouveau avec section

//   if (loading) {
//     return <p className="p-3">Chargement des questions…</p>;
//   }

//   return (
//     <div className="p-3">
//       <h2 className="mb-3">🧩 Questions du survey</h2>
//       {isAdvanced && (
//         <div className="alert alert-danger">
//           <strong>🚫 Mode avancé</strong>
//           <p className="mb-2">
//             Les questions sont gérées via le Survey Builder
//           </p>
//           <button
//             className="btn btn-light"
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}
//       {/* ===================== Nouveau avec secyion */}
//       {!isAdvanced && (
//         <div className="mb-3">
//           <label className="form-label">
//             <strong>📂 Section de la question</strong>
//           </label>

//           <select
//             className="form-select"
//             value={selectedSectionId ?? ""}
//             onChange={(e) => setSelectedSectionId(e.target.value || null)}
//           >
//             <option value="">🗂️ Aucune section</option>

//             {sections.map((section) => (
//               <option key={section.id} value={section.id}>
//                 {section.title}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* ===================== Nouveau avec secyion */}
//       {!isAdvanced && (
//         <div className="mb-4">
//           <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
//         </div>
//       )}
//       {/*
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {/* ===== Sections ===== */}
//       {sections.map((section) => (
//         <SortableContext
//           key={section.id}
//           items={questionsBySection[section.id]?.map((q) => q.id) ?? []}
//           strategy={verticalListSortingStrategy}
//         >
//           <SectionBlock
//             section={section}
//             questions={questionsBySection[section.id] || []}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       ))}

//       {/* ===== Questions sans section ===== */}
//       <SortableContext
//         items={questionsBySection["__unassigned__"]?.map((q) => q.id) ?? []}
//         strategy={verticalListSortingStrategy}
//       >
//         <SectionBlock
//           section={null}
//           questions={questionsBySection["__unassigned__"] || []}
//           onDeleteQuestion={deleteQuestion}
//           onUpdateQuestion={updateQuestion}
//           disabled={isAdvanced}
//         />
//       </SortableContext>
//       {/* </DndContext> */}
//       {/* <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={sections.map((s) => `section-${s.id}`)}
//           strategy={verticalListSortingStrategy}
//         >
//           {sections.map((section) => (
//             <SortableContext
//               key={section.id}
//               items={questionsBySection[section.id]?.map((q) => q.id) ?? []}
//               strategy={verticalListSortingStrategy}
//             >
//               <SectionBlock
//                 section={section}
//                 questions={questionsBySection[section.id] || []}
//                 onDeleteQuestion={deleteQuestion}
//                 onUpdateQuestion={updateQuestion}
//                 disabled={isAdvanced}
//               />
//             </SortableContext>
//           ))}
//         </SortableContext>
//       </DndContext> */}
//       {/* ===================== DRAG & DROP ===================== */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {/* UN SEUL SortableContext pour TOUTES les questions */}
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           {/* Sections existantes */}
//           {sections.map((section) => (
//             <SectionBlock
//               key={section.id}
//               section={section}
//               questions={questionsBySection[section.id] || []}
//               onDeleteQuestion={deleteQuestion}
//               onUpdateQuestion={updateQuestion}
//               disabled={isAdvanced}
//             />
//           ))}

//           {/* Questions sans section */}
//           <SectionBlock
//             section={null}
//             questions={questionsBySection["__unassigned__"] || []}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

//       {/* =================== FIN DRAG & DROP =================== */}

//       {/* <div className="mt-4 p-3 border rounded" style={{ height: "400px" }}>
//         <QuestionDependencyGraph questions={questions} />
//       </div> */}
//       <h4 className="mt-4">🔗 Dépendances entre questions</h4>
//       <div
//         className="border rounded p-2"
//         style={{ height: 500, background: "#fafafa" }}
//       >
//         <QuestionDependencyGraph questions={questions} />
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ===========================================
