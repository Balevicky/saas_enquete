import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import questionService, { Question } from "../../services/questionService";
import surveyService, { Survey } from "../../services/surveyService";
import sectionService, { Section } from "../../services/sectionService";

import QuestionForm from "../../components/questions/QuestionForm";
import SectionBlock from "../../components/sections/SectionBlock";
import SortableQuestionItem from "../../components/questions/SortableQuestionItem";
import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";

import { QuestionType } from "../../types/question";
import { useConfirm } from "../../components/ConfirmProvider";

const UNASSIGNED = "__unassigned__";

const SurveyQuestionsPage = () => {
  const navigate = useNavigate();
  const { tenantSlug, surveyId } = useParams<{
    tenantSlug: string;
    surveyId: string;
  }>();

  const confirm = useConfirm();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const isAdvanced = survey?.mode === "ADVANCED";

  // ======================
  // INITIAL LOAD ONLY
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
      setSections(sectionsRes.sort((a, b) => a.position - b.position));
      setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
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
    map[UNASSIGNED] = [];

    questions.forEach((q) => {
      const key = q.sectionId ?? UNASSIGNED;
      map[key]?.push(q);
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.position - b.position)
    );

    return map;
  }, [questions, sections]);

  // ======================
  // CRUD QUESTIONS (NO RELOAD)
  // ======================
  const createQuestion = async (data: {
    label: string;
    type: QuestionType;
    options?: string[];
    config?: { min: number; max: number };
    nextMap?: Record<string, string>;
  }) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    const key = selectedSectionId ?? UNASSIGNED;
    const sectionQuestions = questionsBySection[key] || [];
    const newPosition = sectionQuestions.length + 1;

    const created = await questionService.create(tenantSlug, surveyId, {
      ...data,
      sectionId: selectedSectionId,
      position: newPosition,
    });

    setQuestions((prev) => [...prev, created]);
    setSelectedSectionId(null);
  };

  const updateQuestion = async (id: string, data: Partial<Question>) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    const updated = await questionService.update(
      tenantSlug,
      surveyId,
      id,
      data
    );

    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updated } : q))
    );
  };

  const deleteQuestion = async (id: string) => {
    if (!tenantSlug || !surveyId || isAdvanced) return;

    const questionToDelete = questions.find((q) => q.id === id);
    if (!questionToDelete) return;

    const confirmed = await confirm(
      <>
        <p>Es-tu sûr de vouloir supprimer la question :</p>
        <strong>{questionToDelete.label}</strong>
        <p className="text-danger mt-2">Cette action est irréversible.</p>
      </>,
      {
        title: "Confirmer la suppression",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (!confirmed) return;

    await questionService.remove(tenantSlug, surveyId, id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ======================
  // DND HELPERS
  // ======================
  const findSectionIdByQuestionId = (questionId: string): string | null => {
    for (const [sectionId, list] of Object.entries(questionsBySection)) {
      if (list.some((q) => q.id === questionId)) {
        return sectionId === UNASSIGNED ? null : sectionId;
      }
    }
    return null;
  };

  const findIndexInSection = (
    sectionId: string | null,
    questionId: string
  ): number => {
    const key = sectionId ?? UNASSIGNED;
    return questionsBySection[key]?.findIndex((q) => q.id === questionId) ?? -1;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isAdvanced) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceSectionId = findSectionIdByQuestionId(activeId);
    const targetSectionId = findSectionIdByQuestionId(overId);

    const sourceIndex = findIndexInSection(sourceSectionId, activeId);
    const targetIndex = findIndexInSection(targetSectionId, overId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const movedQuestion = questions.find((q) => q.id === activeId);
    if (!movedQuestion) return;

    const bySection: Record<string, Question[]> = {};
    Object.entries(questionsBySection).forEach(
      ([k, v]) => (bySection[k] = [...v])
    );

    const sourceKey = sourceSectionId ?? UNASSIGNED;
    const targetKey = targetSectionId ?? UNASSIGNED;

    bySection[sourceKey].splice(sourceIndex, 1);
    bySection[targetKey].splice(targetIndex, 0, {
      ...movedQuestion,
      sectionId: targetSectionId,
    });

    Object.values(bySection).forEach((list) =>
      list.forEach((q, i) => (q.position = i + 1))
    );

    setQuestions(Object.values(bySection).flat());

    try {
      await questionService.reorder(
        tenantSlug!,
        surveyId!,
        activeId,
        sourceSectionId,
        targetSectionId,
        targetIndex + 1
      );
    } catch (e) {
      console.error("Reorder échoué → rollback", e);
      load();
    }
  };

  if (loading) return <p className="p-3">Chargement…</p>;

  return (
    <div className="p-3">
      <h2 className="mb-3">🧩 Questions du survey</h2>

      {isAdvanced && (
        <div className="alert alert-danger">
          <strong>🚫 Mode avancé</strong>
          <button
            className="btn btn-light mt-2"
            onClick={() =>
              navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
            }
          >
            Ouvrir le Builder
          </button>
        </div>
      )}

      {!isAdvanced && (
        <>
          <select
            className="form-select mb-3"
            value={selectedSectionId ?? ""}
            onChange={(e) => setSelectedSectionId(e.target.value || null)}
          >
            <option value="">🗂️ Aucune section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
        </>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {sections.map((section) => (
          <SortableContext
            key={section.id}
            items={questionsBySection[section.id].map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <SectionBlock
              section={section}
              questions={questionsBySection[section.id]}
              onDeleteQuestion={deleteQuestion}
              onUpdateQuestion={updateQuestion}
              disabled={isAdvanced}
            >
              {questionsBySection[section.id].map((q) => (
                <SortableQuestionItem
                  key={q.id}
                  question={q}
                  allQuestions={questions}
                  onDelete={deleteQuestion}
                  onUpdate={updateQuestion}
                  disabled={isAdvanced}
                />
              ))}
            </SectionBlock>
          </SortableContext>
        ))}

        <SortableContext
          items={questionsBySection[UNASSIGNED].map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <SectionBlock
            section={null}
            questions={questionsBySection[UNASSIGNED]}
            onDeleteQuestion={deleteQuestion}
            onUpdateQuestion={updateQuestion}
            disabled={isAdvanced}
          >
            {questionsBySection[UNASSIGNED].map((q) => (
              <SortableQuestionItem
                key={q.id}
                question={q}
                allQuestions={questions}
                onDelete={deleteQuestion}
                onUpdate={updateQuestion}
                disabled={isAdvanced}
              />
            ))}
          </SectionBlock>
        </SortableContext>
      </DndContext>

      <h4 className="mt-4">🔗 Dépendances</h4>
      <div className="border rounded p-2" style={{ height: 500 }}>
        <QuestionDependencyGraph questions={questions} />
      </div>
    </div>
  );
};

export default SurveyQuestionsPage;

// // ===================================== bon mais à l'ajout d'une nouvelle question, les position  sont reordonner par section avec rechargement de la page
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import sectionService, { Section } from "../../services/sectionService";

// import QuestionForm from "../../components/questions/QuestionForm";
// import SectionBlock from "../../components/sections/SectionBlock";
// import SortableQuestionItem from "../../components/questions/SortableQuestionItem";
// import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";

// import { QuestionType } from "../../types/question";
// import { useConfirm } from "../../components/ConfirmProvider";

// const UNASSIGNED = "__unassigned__";

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const confirm = useConfirm();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         sectionService.list(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId),
//       ]);

//       setSurvey(surveyRes);
//       setSections(sectionsRes.sort((a, b) => a.position - b.position));
//       setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // DERIVED DATA
//   // ======================
//   const questionsBySection = useMemo(() => {
//     const map: Record<string, Question[]> = {};
//     sections.forEach((s) => (map[s.id] = []));
//     map[UNASSIGNED] = [];

//     questions.forEach((q) => {
//       const key = q.sectionId ?? UNASSIGNED;
//       map[key]?.push(q);
//     });

//     Object.values(map).forEach((list) =>
//       list.sort((a, b) => a.position - b.position)
//     );

//     return map;
//   }, [questions, sections]);

//   // ======================
//   // NORMALIZE POSITIONS
//   // ======================
//   const normalizePositions = (qs: Question[]) => {
//     const bySection: Record<string, Question[]> = {};
//     sections.forEach((s) => (bySection[s.id] = []));
//     bySection[UNASSIGNED] = [];

//     qs.forEach((q) => {
//       const key = q.sectionId ?? UNASSIGNED;
//       bySection[key].push(q);
//     });

//     Object.values(bySection).forEach((list) =>
//       list
//         .sort((a, b) => a.position - b.position)
//         .forEach((q, i) => (q.position = i + 1))
//     );

//     return Object.values(bySection).flat();
//   };

//   // ======================
//   // CRUD QUESTIONS
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//   }) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     const key = selectedSectionId ?? UNASSIGNED;
//     const sectionQuestions = questionsBySection[key] || [];
//     const newPosition = sectionQuestions.length + 1;

//     await questionService.create(tenantSlug, surveyId, {
//       ...data,
//       sectionId: selectedSectionId,
//       position: newPosition,
//     });

//     await load();
//     setSelectedSectionId(null);
//   };

//   const updateQuestion = async (id: string, data: Partial<Question>) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;
//     await questionService.update(tenantSlug, surveyId, id, data);
//     await load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     const questionToDelete = questions.find((q) => q.id === id);
//     if (!questionToDelete) return;

//     const confirmed = await confirm(
//       <>
//         <p>Es-tu sûr de vouloir supprimer la question :</p>
//         <strong>{questionToDelete.label}</strong>
//         <p className="text-danger mt-2">Cette action est irréversible.</p>
//       </>,
//       {
//         title: "Confirmer la suppression",
//         confirmText: "Supprimer",
//         cancelText: "Annuler",
//       }
//     );

//     if (!confirmed) return;

//     await questionService.remove(tenantSlug, surveyId, id);
//     await load();
//   };

//   // ======================
//   // DnD HELPERS
//   // ======================
//   const findSectionIdByQuestionId = (questionId: string): string | null => {
//     for (const [sectionId, list] of Object.entries(questionsBySection)) {
//       if (list.some((q) => q.id === questionId)) {
//         return sectionId === UNASSIGNED ? null : sectionId;
//       }
//     }
//     return null;
//   };

//   const findIndexInSection = (
//     sectionId: string | null,
//     questionId: string
//   ): number => {
//     const key = sectionId ?? UNASSIGNED;
//     return questionsBySection[key]?.findIndex((q) => q.id === questionId) ?? -1;
//   };

//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const activeId = active.id as string;
//     const overId = over.id as string;

//     const sourceSectionId = findSectionIdByQuestionId(activeId);
//     const targetSectionId = findSectionIdByQuestionId(overId);

//     const sourceIndex = findIndexInSection(sourceSectionId, activeId);
//     const targetIndex = findIndexInSection(targetSectionId, overId);

//     if (sourceIndex === -1 || targetIndex === -1) return;

//     const movedQuestion = questions.find((q) => q.id === activeId);
//     if (!movedQuestion) return;

//     const bySection: Record<string, Question[]> = {};
//     Object.entries(questionsBySection).forEach(
//       ([k, v]) => (bySection[k] = [...v])
//     );

//     const sourceKey = sourceSectionId ?? UNASSIGNED;
//     const targetKey = targetSectionId ?? UNASSIGNED;

//     bySection[sourceKey].splice(sourceIndex, 1);
//     bySection[targetKey].splice(targetIndex, 0, {
//       ...movedQuestion,
//       sectionId: targetSectionId,
//     });

//     Object.values(bySection).forEach((list) =>
//       list.forEach((q, i) => (q.position = i + 1))
//     );

//     setQuestions(Object.values(bySection).flat());

//     try {
//       await questionService.reorder(
//         tenantSlug!,
//         surveyId!,
//         activeId,
//         sourceSectionId,
//         targetSectionId,
//         targetIndex + 1
//       );
//     } catch (e) {
//       console.error("Reorder échoué → rollback", e);
//       load();
//     }
//   };

//   if (loading) return <p className="p-3">Chargement…</p>;

//   return (
//     <div className="p-3">
//       <h2 className="mb-3">🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div className="alert alert-danger">
//           <strong>🚫 Mode avancé</strong>
//           <button
//             className="btn btn-light mt-2"
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && (
//         <>
//           <select
//             className="form-select mb-3"
//             value={selectedSectionId ?? ""}
//             onChange={(e) => setSelectedSectionId(e.target.value || null)}
//           >
//             <option value="">🗂️ Aucune section</option>
//             {sections.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.title}
//               </option>
//             ))}
//           </select>

//           <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
//         </>
//       )}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {sections.map((section) => (
//           <SortableContext
//             key={section.id}
//             items={questionsBySection[section.id].map((q) => q.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             <SectionBlock
//               section={section}
//               questions={questionsBySection[section.id]}
//               onDeleteQuestion={deleteQuestion}
//               onUpdateQuestion={updateQuestion}
//               disabled={isAdvanced}
//             >
//               {questionsBySection[section.id].map((q) => (
//                 <SortableQuestionItem
//                   key={q.id}
//                   question={q}
//                   allQuestions={questions}
//                   onDelete={deleteQuestion}
//                   onUpdate={updateQuestion}
//                   disabled={isAdvanced}
//                 />
//               ))}
//             </SectionBlock>
//           </SortableContext>
//         ))}

//         <SortableContext
//           items={questionsBySection[UNASSIGNED].map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <SectionBlock
//             section={null}
//             questions={questionsBySection[UNASSIGNED]}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           >
//             {questionsBySection[UNASSIGNED].map((q) => (
//               <SortableQuestionItem
//                 key={q.id}
//                 question={q}
//                 allQuestions={questions}
//                 onDelete={deleteQuestion}
//                 onUpdate={updateQuestion}
//                 disabled={isAdvanced}
//               />
//             ))}
//           </SectionBlock>
//         </SortableContext>
//       </DndContext>

//       <h4 className="mt-4">🔗 Dépendances</h4>
//       <div className="border rounded p-2" style={{ height: 500 }}>
//         <QuestionDependencyGraph questions={questions} />
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// // ===================================== bon mais à l'ajout d'une nouvelle question pas les position ne sont reordonner par section
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import sectionService, { Section } from "../../services/sectionService";

// import QuestionForm from "../../components/questions/QuestionForm";
// import SectionBlock from "../../components/sections/SectionBlock";
// import SortableQuestionItem from "../../components/questions/SortableQuestionItem";
// import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";

// import { QuestionType } from "../../types/question";

// const UNASSIGNED = "__unassigned__";

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
//       const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
//         surveyService.get(tenantSlug, surveyId),
//         sectionService.list(tenantSlug, surveyId),
//         questionService.list(tenantSlug, surveyId),
//       ]);

//       setSurvey(surveyRes);
//       setSections(sectionsRes.sort((a, b) => a.position - b.position));
//       setQuestions(questionsRes.data.sort((a, b) => a.position - b.position));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // DERIVED DATA
//   // ======================
//   const questionsBySection = useMemo(() => {
//     const map: Record<string, Question[]> = {};

//     sections.forEach((s) => (map[s.id] = []));
//     map[UNASSIGNED] = [];

//     questions.forEach((q) => {
//       const key = q.sectionId ?? UNASSIGNED;
//       map[key]?.push(q);
//     });

//     Object.values(map).forEach((list) =>
//       list.sort((a, b) => a.position - b.position)
//     );

//     return map;
//   }, [questions, sections]);

//   // ======================
//   // CRUD QUESTIONS
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//   }) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.create(tenantSlug, surveyId, {
//       ...data,
//       sectionId: selectedSectionId,
//       position: questions.length + 1,
//     });

//     load();
//     setSelectedSectionId(null);
//   };

//   const updateQuestion = async (id: string, data: Partial<Question>) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;
//     await questionService.update(tenantSlug, surveyId, id, data);
//     load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;
//     await questionService.remove(tenantSlug, surveyId, id);
//     load();
//   };

//   // ======================
//   // DnD HELPERS
//   // ======================
//   const findSectionIdByQuestionId = (questionId: string): string | null => {
//     for (const [sectionId, list] of Object.entries(questionsBySection)) {
//       if (list.some((q) => q.id === questionId)) {
//         return sectionId === UNASSIGNED ? null : sectionId;
//       }
//     }
//     return null;
//   };

//   const findIndexInSection = (
//     sectionId: string | null,
//     questionId: string
//   ): number => {
//     const key = sectionId ?? UNASSIGNED;
//     return questionsBySection[key]?.findIndex((q) => q.id === questionId) ?? -1;
//   };

//   // ======================
//   // HANDLE DRAG END
//   // ======================
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const activeId = active.id as string;
//     const overId = over.id as string;

//     const sourceSectionId = findSectionIdByQuestionId(activeId);
//     const targetSectionId = findSectionIdByQuestionId(overId);

//     const sourceIndex = findIndexInSection(sourceSectionId, activeId);
//     const targetIndex = findIndexInSection(targetSectionId, overId);

//     if (sourceIndex === -1 || targetIndex === -1) return;

//     const movedQuestion = questions.find((q) => q.id === activeId);
//     if (!movedQuestion) return;

//     const bySection: Record<string, Question[]> = {};
//     Object.entries(questionsBySection).forEach(
//       ([k, v]) => (bySection[k] = [...v])
//     );

//     const sourceKey = sourceSectionId ?? UNASSIGNED;
//     const targetKey = targetSectionId ?? UNASSIGNED;

//     bySection[sourceKey].splice(sourceIndex, 1);
//     bySection[targetKey].splice(targetIndex, 0, {
//       ...movedQuestion,
//       sectionId: targetSectionId,
//     });

//     Object.values(bySection).forEach((list) =>
//       list.forEach((q, i) => (q.position = i + 1))
//     );

//     const rebuilt = Object.values(bySection).flat();
//     setQuestions(rebuilt);

//     try {
//       await questionService.reorder(
//         tenantSlug!,
//         surveyId!,
//         activeId,
//         sourceSectionId,
//         targetSectionId,
//         targetIndex + 1
//       );
//     } catch (e) {
//       console.error("Reorder échoué → rollback", e);
//       setQuestions(questions);
//     }
//   };

//   if (loading) return <p className="p-3">Chargement…</p>;

//   return (
//     <div className="p-3">
//       <h2 className="mb-3">🧩 Questions du survey</h2>

//       {isAdvanced && (
//         <div className="alert alert-danger">
//           <strong>🚫 Mode avancé</strong>
//           <button
//             className="btn btn-light mt-2"
//             onClick={() =>
//               navigate(`/t/${tenantSlug}/surveys/${surveyId}/builder`)
//             }
//           >
//             Ouvrir le Builder
//           </button>
//         </div>
//       )}

//       {!isAdvanced && (
//         <>
//           <select
//             className="form-select mb-3"
//             value={selectedSectionId ?? ""}
//             onChange={(e) => setSelectedSectionId(e.target.value || null)}
//           >
//             <option value="">🗂️ Aucune section</option>
//             {sections.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.title}
//               </option>
//             ))}
//           </select>

//           <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
//         </>
//       )}

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {sections.map((section) => (
//           <SortableContext
//             key={section.id}
//             items={questionsBySection[section.id].map((q) => q.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             <SectionBlock
//               section={section}
//               questions={questionsBySection[section.id]}
//               onDeleteQuestion={deleteQuestion}
//               onUpdateQuestion={updateQuestion}
//               disabled={isAdvanced}
//             >
//               {questionsBySection[section.id].map((q) => (
//                 <SortableQuestionItem
//                   key={q.id}
//                   question={q}
//                   allQuestions={questions}
//                   onDelete={deleteQuestion}
//                   onUpdate={updateQuestion}
//                   disabled={isAdvanced}
//                 />
//               ))}
//             </SectionBlock>
//           </SortableContext>
//         ))}

//         <SortableContext
//           items={questionsBySection[UNASSIGNED].map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <SectionBlock
//             section={null}
//             questions={questionsBySection[UNASSIGNED]}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           >
//             {questionsBySection[UNASSIGNED].map((q) => (
//               <SortableQuestionItem
//                 key={q.id}
//                 question={q}
//                 allQuestions={questions}
//                 onDelete={deleteQuestion}
//                 onUpdate={updateQuestion}
//                 disabled={isAdvanced}
//               />
//             ))}
//           </SectionBlock>
//         </SortableContext>
//       </DndContext>

//       <h4 className="mt-4">🔗 Dépendances</h4>
//       <div className="border rounded p-2" style={{ height: 500 }}>
//         <QuestionDependencyGraph questions={questions} />
//       </div>
//     </div>
//   );
// };

// export default SurveyQuestionsPage;

// ===================================== bon aléatoirement
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";

// import questionService, { Question } from "../../services/questionService";
// import surveyService, { Survey } from "../../services/surveyService";
// import QuestionForm from "../../components/questions/QuestionForm";
// import SectionBlock from "../../components/sections/SectionBlock";
// import { QuestionType } from "../../types/question";
// import QuestionDependencyGraph from "../../components/questions/QuestionDependencyGraph";
// import sectionService, { Section } from "../../services/sectionService";
// import SortableQuestionItem from "../../components/questions/SortableQuestionItem";

// const SurveyQuestionsPage = () => {
//   const navigate = useNavigate();
//   const { tenantSlug, surveyId } = useParams<{
//     tenantSlug: string;
//     surveyId: string;
//   }>();

//   const [survey, setSurvey] = useState<Survey | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   const isAdvanced = survey?.mode === "ADVANCED";

//   // ======================
//   // LOAD
//   // ======================
//   const load = async () => {
//     if (!tenantSlug || !surveyId) return;
//     setLoading(true);

//     try {
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
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [tenantSlug, surveyId]);

//   // ======================
//   // DERIVED DATA
//   // // ======================
//   // const questionsBySection = useMemo(() => {
//   //   const map: Record<string, Question[]> = {};

//   //   sections.forEach((s) => (map[s.id] = []));
//   //   map["__unassigned__"] = [];

//   //   questions.forEach((q) => {
//   //     if (q.sectionId && map[q.sectionId]) map[q.sectionId].push(q);
//   //     else map["__unassigned__"].push(q);
//   //   });

//   //   Object.values(map).forEach((list) =>
//   //     list.sort((a, b) => a.position - b.position)
//   //   );

//   //   return map;
//   // }, [sections, questions]);
//   // ============ nouveau marche mais deplacement pas tres bon
//   // const questionsBySection = useMemo(() => {
//   //   const map: Record<string, Question[]> = {};

//   //   // sections connues
//   //   sections.forEach((s) => {
//   //     map[s.id] = [];
//   //   });

//   //   // questions sans section
//   //   map["__unassigned__"] = [];

//   //   questions.forEach((q) => {
//   //     const key = q.sectionId ?? "__unassigned__";
//   //     if (!map[key]) map[key] = [];
//   //     map[key].push(q);
//   //   });

//   //   // tri par position
//   //   Object.values(map).forEach((list) =>
//   //     list.sort((a, b) => a.position - b.position)
//   //   );

//   //   return map;
//   // }, [questions, sections]);
//   // ============ nouveau
//   const questionsBySection = useMemo(() => {
//     const map: Record<string, Question[]> = {};

//     // sections existantes
//     sections.forEach((s) => {
//       map[s.id] = [];
//     });

//     // questions sans section
//     map["__unassigned__"] = [];

//     questions.forEach((q) => {
//       const key = q.sectionId ?? "__unassigned__";
//       if (!map[key]) map[key] = [];
//       map[key].push(q);
//     });

//     // tri par position
//     Object.values(map).forEach((list) =>
//       list.sort((a, b) => a.position - b.position)
//     );

//     return map;
//   }, [questions, sections]);

//   // ======================
//   // CREATE / UPDATE / DELETE
//   // ======================
//   const createQuestion = async (data: {
//     label: string;
//     type: QuestionType;
//     options?: string[];
//     config?: { min: number; max: number };
//     nextMap?: Record<string, string>;
//   }) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.create(tenantSlug, surveyId, {
//       ...data,
//       sectionId: selectedSectionId,
//       position: questions.length + 1,
//     });

//     load();
//     setSelectedSectionId(null);
//   };

//   const updateQuestion = async (id: string, data: Partial<Question>) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;
//     await questionService.update(tenantSlug, surveyId, id, data);
//     load();
//   };

//   const deleteQuestion = async (id: string) => {
//     if (!tenantSlug || !surveyId || isAdvanced) return;

//     await questionService.remove(tenantSlug, surveyId, id);

//     const res = await questionService.list(tenantSlug, surveyId);
//     const reordered = [...res.data]
//       .sort((a, b) => a.position - b.position)
//       .map((q, index) => ({ ...q, position: index + 1 }));

//     for (const q of reordered) {
//       await questionService.update(tenantSlug, surveyId, q.id, {
//         position: q.position,
//       });
//     }

//     setQuestions(reordered);
//   };

//   // ======================
//   // DRAG & DROP
//   // ======================
//   // const findSectionIdByQuestionId = (questionId: string) => {
//   //   for (const [sectionId, list] of Object.entries(questionsBySection)) {
//   //     if (list.some((q) => q.id === questionId)) {
//   //       return sectionId === "__unassigned__" ? null : sectionId;
//   //     }
//   //   }
//   //   return null;
//   // };

//   // const findIndexInSection = (sectionId: string | null, questionId: string) => {
//   //   const key = sectionId ?? "__unassigned__";
//   //   return questionsBySection[key]?.findIndex((q) => q.id === questionId) ?? -1;
//   // };
//   // ================= nouveau
//   // Retrouver la section d'une question
//   const findSectionIdByQuestionId = (questionId: string) => {
//     for (const [sectionId, list] of Object.entries(questionsBySection)) {
//       if (list.some((q) => q.id === questionId)) {
//         return sectionId === "__unassigned__" ? null : sectionId;
//       }
//     }
//     return null;
//   };

//   // Index d'une question dans sa section
//   const findIndexInSection = (sectionId: string | null, questionId: string) => {
//     const key = sectionId ?? "__unassigned__";
//     return questionsBySection[key]?.findIndex((q) => q.id === questionId) ?? -1;
//   };

//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   const movedQuestion = questions.find((q) => q.id === active.id);
//   //   const targetQuestion = questions.find((q) => q.id === over.id);

//   //   if (!movedQuestion || !targetQuestion) return;

//   //   try {
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       movedQuestion.id,
//   //       movedQuestion.sectionId ?? null,
//   //       targetQuestion.sectionId ?? null,
//   //       targetQuestion.position
//   //     );

//   //     await load();
//   //   } catch (e) {
//   //     console.error("Erreur reorder question", e);
//   //   }
//   // };
//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   const oldIndex = questions.findIndex((q) => q.id === active.id);
//   //   const newIndex = questions.findIndex((q) => q.id === over.id);

//   //   if (oldIndex === -1 || newIndex === -1) return;

//   //   // 🟢 1️⃣ Update UI immédiatement
//   //   const reordered = arrayMove(questions, oldIndex, newIndex).map(
//   //     (q, index) => ({
//   //       ...q,
//   //       position: index + 1,
//   //     })
//   //   );

//   //   setQuestions(reordered);

//   //   // 🟡 2️⃣ Sync backend (sans reload)
//   //   try {
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       active.id as string,
//   //       questions[oldIndex].sectionId ?? null,
//   //       questions[newIndex].sectionId ?? null,
//   //       newIndex + 1
//   //     );
//   //   } catch (e) {
//   //     console.error("Reorder échoué → rollback", e);
//   //     // 🔴 rollback sécurité
//   //     setQuestions(questions);
//   //   }
//   // };
//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   const oldIndex = questions.findIndex((q) => q.id === active.id);
//   //   const newIndex = questions.findIndex((q) => q.id === over.id);

//   //   if (oldIndex === -1 || newIndex === -1) return;

//   //   const sourceSectionId = questions[oldIndex].sectionId ?? null;
//   //   const targetSectionId = questions[newIndex].sectionId ?? null;

//   //   // 🟢 UI optimistic update
//   //   const reordered = arrayMove(questions, oldIndex, newIndex).map(
//   //     (q, index) => ({
//   //       ...q,
//   //       position: index + 1,
//   //     })
//   //   );

//   //   setQuestions(reordered);

//   //   try {
//   //     // 🟡 Backend sync — UNE SEULE API
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       active.id as string,
//   //       sourceSectionId,
//   //       targetSectionId,
//   //       newIndex + 1
//   //     );
//   //   } catch (e) {
//   //     console.error("Reorder échoué → rollback", e);
//   //     setQuestions(questions);
//   //   }
//   // };
//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   const activeId = active.id as string;
//   //   const overId = over.id as string;

//   //   const sourceSectionId = findSectionIdByQuestionId(activeId);
//   //   const targetSectionId = findSectionIdByQuestionId(overId);

//   //   if (sourceSectionId === undefined || targetSectionId === undefined) return;

//   //   const sourceIndex = findIndexInSection(sourceSectionId, activeId);
//   //   const targetIndex = findIndexInSection(targetSectionId, overId);

//   //   if (sourceIndex === -1 || targetIndex === -1) return;

//   //   // 🟢 UI optimistic update (reconstruit questions[])
//   //   const updatedQuestions = [...questions];

//   //   const movedQuestion = updatedQuestions.find((q) => q.id === activeId);
//   //   if (!movedQuestion) return;

//   //   // retirer de la source
//   //   const sourceKey = sourceSectionId ?? "__unassigned__";
//   //   const targetKey = targetSectionId ?? "__unassigned__";

//   //   const sourceList = questionsBySection[sourceKey];
//   //   const targetList = questionsBySection[targetKey];

//   //   const newSourceList = [...sourceList];
//   //   newSourceList.splice(sourceIndex, 1);

//   //   const newTargetList =
//   //     sourceKey === targetKey ? newSourceList : [...targetList];

//   //   newTargetList.splice(targetIndex, 0, {
//   //     ...movedQuestion,
//   //     sectionId: targetSectionId,
//   //   });

//   //   // réassigner positions
//   //   newSourceList.forEach((q, i) => (q.position = i + 1));
//   //   newTargetList.forEach((q, i) => (q.position = i + 1));

//   //   const rebuilt = updatedQuestions.map((q) => {
//   //     if (q.id === activeId) {
//   //       return {
//   //         ...q,
//   //         sectionId: targetSectionId,
//   //         position: targetIndex + 1,
//   //       };
//   //     }

//   //     if (sourceKey === targetKey) {
//   //       const found = newTargetList.find((n) => n.id === q.id);
//   //       return found ?? q;
//   //     }

//   //     const inSource = newSourceList.find((n) => n.id === q.id);
//   //     if (inSource) return inSource;

//   //     const inTarget = newTargetList.find((n) => n.id === q.id);
//   //     if (inTarget) return inTarget;

//   //     return q;
//   //   });

//   //   setQuestions(rebuilt);

//   //   // 🟡 Backend sync
//   //   try {
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       activeId,
//   //       sourceSectionId,
//   //       targetSectionId,
//   //       targetIndex + 1
//   //     );
//   //   } catch (e) {
//   //     console.error("Reorder échoué → rollback", e);
//   //     setQuestions(questions);
//   //   }
//   // };
//   // =================== marche mais ps bien
//   // const handleDragEnd = async (event: DragEndEvent) => {
//   //   if (isAdvanced) return;

//   //   const { active, over } = event;
//   //   if (!over || active.id === over.id) return;

//   //   const activeId = active.id as string;
//   //   const overId = over.id as string;

//   //   const sourceSectionId = findSectionIdByQuestionId(activeId);
//   //   const targetSectionId = findSectionIdByQuestionId(overId);

//   //   if (sourceSectionId === undefined || targetSectionId === undefined) return;

//   //   const sourceIndex = findIndexInSection(sourceSectionId, activeId);
//   //   const targetIndex = findIndexInSection(targetSectionId, overId);

//   //   if (sourceIndex === -1 || targetIndex === -1) return;

//   //   const movedQuestion = questions.find((q) => q.id === activeId);
//   //   if (!movedQuestion) return;

//   //   // 🔹 Copie par section pour manipuler
//   //   const updatedBySection: Record<string, Question[]> = {};
//   //   Object.entries(questionsBySection).forEach(([key, list]) => {
//   //     updatedBySection[key] = [...list];
//   //   });

//   //   const sourceKey = sourceSectionId ?? "__unassigned__";
//   //   const targetKey = targetSectionId ?? "__unassigned__";

//   //   // Retirer de la source
//   //   updatedBySection[sourceKey].splice(sourceIndex, 1);

//   //   // Ajouter dans la cible
//   //   updatedBySection[targetKey].splice(targetIndex, 0, {
//   //     ...movedQuestion,
//   //     sectionId: targetSectionId,
//   //   });

//   //   // Réassigner positions dans toutes les sections
//   //   Object.values(updatedBySection).forEach((list) =>
//   //     list.forEach((q, i) => (q.position = i + 1))
//   //   );

//   //   // Reconstruire questions[]
//   //   const rebuilt = Object.values(updatedBySection).flat();

//   //   setQuestions(rebuilt);

//   //   // 🟡 Backend sync
//   //   try {
//   //     await questionService.reorder(
//   //       tenantSlug!,
//   //       surveyId!,
//   //       activeId,
//   //       sourceSectionId,
//   //       targetSectionId,
//   //       targetIndex + 1
//   //     );
//   //   } catch (e) {
//   //     console.error("Reorder échoué → rollback", e);
//   //     setQuestions(questions);
//   //   }
//   // };
//   // ================== nouveau
//   const handleDragEnd = async (event: DragEndEvent) => {
//     if (isAdvanced) return;

//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const activeId = active.id as string;
//     const overId = over.id as string;

//     const sourceSectionId = findSectionIdByQuestionId(activeId);
//     const targetSectionId = findSectionIdByQuestionId(overId);

//     if (sourceSectionId === undefined || targetSectionId === undefined) return;

//     const sourceIndex = findIndexInSection(sourceSectionId, activeId);
//     const targetIndex = findIndexInSection(targetSectionId, overId);

//     if (sourceIndex === -1 || targetIndex === -1) return;

//     const movedQuestion = questions.find((q) => q.id === activeId);
//     if (!movedQuestion) return;

//     // 🔹 Copier par section
//     const updatedBySection: Record<string, Question[]> = {};
//     Object.entries(questionsBySection).forEach(([key, list]) => {
//       updatedBySection[key] = [...list];
//     });

//     const sourceKey = sourceSectionId ?? "__unassigned__";
//     const targetKey = targetSectionId ?? "__unassigned__";

//     // Retirer de la source
//     updatedBySection[sourceKey].splice(sourceIndex, 1);

//     // Ajouter dans la cible
//     updatedBySection[targetKey].splice(targetIndex, 0, {
//       ...movedQuestion,
//       sectionId: targetSectionId,
//     });

//     // Réassigner positions dans chaque section
//     Object.values(updatedBySection).forEach((list) =>
//       list.forEach((q, i) => (q.position = i + 1))
//     );

//     // Reconstruire le tableau global
//     const rebuilt = Object.values(updatedBySection).flat();

//     setQuestions(rebuilt);

//     // Backend sync
//     try {
//       await questionService.reorder(
//         tenantSlug!,
//         surveyId!,
//         activeId,
//         sourceSectionId,
//         targetSectionId,
//         targetIndex + 1
//       );
//     } catch (e) {
//       console.error("Reorder échoué → rollback", e);
//       setQuestions(questions);
//     }
//   };

//   if (loading) return <p className="p-3">Chargement des questions…</p>;

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

//       {!isAdvanced && (
//         <div className="mb-4">
//           <QuestionForm onSubmit={createQuestion} allQuestions={questions} />
//         </div>
//       )}

//       {/* ===================== DRAG & DROP ===================== */}
//       {/* <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
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

//           <SectionBlock
//             section={null}
//             questions={questionsBySection["__unassigned__"] || []}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext> */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={questions.map((q) => q.id)}
//           strategy={verticalListSortingStrategy}
//         >
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

//           <SectionBlock
//             section={null}
//             questions={questionsBySection["__unassigned__"] || []}
//             onDeleteQuestion={deleteQuestion}
//             onUpdateQuestion={updateQuestion}
//             disabled={isAdvanced}
//           />
//         </SortableContext>
//       </DndContext>

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
