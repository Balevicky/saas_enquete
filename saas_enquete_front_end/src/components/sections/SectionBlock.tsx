// src/components/sections/SectionBlock.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Section } from "../../services/sectionService";

interface Props {
  section: Section | null; // null = questions sans section
  questions?: { id: string }[]; // utilisé uniquement pour le badge (optionnel)
  children: React.ReactNode;
}

const UNASSIGNED = "__unassigned__";

const SectionBlock: React.FC<Props> = ({
  section,
  questions = [],
  children,
}) => {
  const droppableId = section ? section.id : UNASSIGNED;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`mb-4 border rounded shadow-sm ${
        isOver ? "border-primary bg-light" : "bg-white"
      }`}
    >
      {/* ===== HEADER (STYLE ANCIEN) ===== */}
      <div className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light border-bottom">
        <h5 className="mb-0">
          {section ? `📂 ${section.title}` : "🗂️ Questions sans section"}
          <span
            className={`badge ms-2 ${
              section ? "bg-secondary" : "bg-warning text-dark"
            }`}
          >
            {questions.length}
          </span>
        </h5>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="p-2">
        {questions.length === 0 ? (
          <div className="text-muted fst-italic">
            Aucune question dans cette section
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SectionBlock;

// // ========================================== Tres BON avec drag&drop inter-section et intra-section
// // src/components/sections/SectionBlock.tsx
// import React from "react";
// import { useDroppable } from "@dnd-kit/core";
// import { Section } from "../../services/sectionService";

// interface Props {
//   section: Section | null;
//   children: React.ReactNode;
// }

// const SectionBlock: React.FC<Props> = ({ section, children }) => {
//   const droppableId = section ? section.id : "__unassigned__";

//   const { setNodeRef, isOver } = useDroppable({
//     id: droppableId,
//   });

//   return (
//     <div
//       ref={setNodeRef}
//       className={`border rounded mb-3 p-2 ${
//         isOver ? "bg-blue-50" : "bg-white"
//       }`}
//     >
//       {section && <h4 className="mb-2 font-semibold">🗂️ {section.title}</h4>}

//       {children}
//     </div>
//   );
// };

// export default SectionBlock;

// ==========================================
// //src/components/sections/SectionBlock.tsx
// import React from "react";
// import { useSortable } from "@dnd-kit/sortable";
// // import { useSortable, useDroppable } from "@dnd-kit/sortable";
// import { useDroppable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
// import { Section } from "../../services/sectionService";

// interface Props {
//   section: Section | null; // null = questions sans section
//   children: React.ReactNode;
// }

// /**
//  * SectionBlock
//  * - Container d’une section
//  * - DROPPABLE pour recevoir des questions (inter-sections)
//  * - SORTABLE optionnel pour déplacer les sections entre elles
//  */
// const SectionBlock: React.FC<Props> = ({ section, children }) => {
//   const sectionId = section ? section.id : "__unassigned__";

//   /**
//    * ✅ Zone DROPPABLE
//    * Permet de déposer une question dans la section
//    */
//   const { setNodeRef: setDropRef, isOver } = useDroppable({
//     id: `section-drop-${sectionId}`,
//   });

//   /**
//    * 🔀 Sortable (sections entre elles)
//    * Désactivé pour la zone "sans section"
//    */
//   const {
//     setNodeRef: setSortRef,
//     transform,
//     transition,
//     attributes,
//     listeners,
//   } = useSortable({
//     id: section ? `section-${section.id}` : "section-unassigned",
//     disabled: section === null,
//   });

//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     backgroundColor: isOver ? "#f0f9ff" : undefined, // feedback visuel
//   };

//   return (
//     <div
//       ref={(node) => {
//         setSortRef(node);
//         setDropRef(node);
//       }}
//       style={style}
//       className="mb-4 border rounded-lg bg-white shadow-sm"
//     >
//       {/* Header section */}
//       {section && (
//         <div
//           className="px-4 py-2 border-b bg-gray-50 cursor-move font-semibold"
//           {...attributes}
//           {...listeners}
//         >
//           {section.title}
//         </div>
//       )}

//       {/* Contenu (questions) */}
//       <div className="p-4 min-h-[40px]">{children}</div>
//     </div>
//   );
// };

// export default SectionBlock;

// ================================= bon mais impossible drag&drop inter-section
// import React from "react";
// import { Section } from "../../services/sectionService";
// import { Question } from "../../services/questionService";
// import QuestionList from "../questions/QuestionList";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// interface Props {
//   section: Section | null; // null = questions sans section
//   questions: Question[];
//   onDeleteQuestion: (id: string) => void;
//   onUpdateQuestion: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
//   children?: React.ReactNode; // ✅ pour inclure des enfants directement si nécessaire
// }

// const SectionBlock: React.FC<Props> = ({
//   section,
//   questions,
//   onDeleteQuestion,
//   onUpdateQuestion,
//   disabled,
//   children,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: section ? `section-${section.id}` : "section-unassigned",
//       disabled: section === null,
//     });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="mb-4 border rounded shadow-sm"
//     >
//       <div className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light">
//         {/* {section && (
//           <span
//             {...attributes}
//             {...listeners}
//             style={{ cursor: "grab" }}
//             className="me-2"
//           >
//             ⠿
//           </span>
//         )} */}
//         <h5 className="mb-0">
//           {section
//             ? // ? `📂 ${section.title ?? section.name}`
//               `📂 ${section.title}`
//             : `🗂️ Questions sans section`}
//           <span
//             className={`badge ms-2 ${
//               section ? "bg-secondary" : "bg-warning text-dark"
//             }`}
//           >
//             {questions.length}
//           </span>
//         </h5>
//       </div>

//       <div className="p-2">
//         {children ? (
//           children
//         ) : questions.length === 0 ? (
//           <div className="text-muted fst-italic">
//             Aucune question dans cette section
//           </div>
//         ) : (
//           <QuestionList
//             questions={questions}
//             onDelete={onDeleteQuestion}
//             onUpdate={onUpdateQuestion}
//             disabled={disabled}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SectionBlock;

// ================================= bon
// import React from "react";
// import { Section } from "../../services/sectionService";
// import { Question } from "../../services/questionService";
// import QuestionList from "../questions/QuestionList";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// interface Props {
//   section: Section | null; // null = questions non assignées
//   questions: Question[];
//   onDeleteQuestion: (id: string) => void;
//   onUpdateQuestion: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }
// const SectionBlock: React.FC<Props> = ({
//   section,
//   questions,
//   onDeleteQuestion,
//   onUpdateQuestion,
//   disabled,
// }) => {
//   return (
//     <div className="mb-4 border rounded">
//       <div className="d-flex align-items-center justify-content-between mb-2">
//         <h5 className="mb-0">
//           {section ? (
//             <>
//               📂 {section.title}
//               <span className="badge bg-secondary ms-2">
//                 {questions.length}
//               </span>
//             </>
//           ) : (
//             <>
//               🗂️ Questions sans section
//               <span className="badge bg-warning text-dark ms-2">
//                 {questions.length}
//               </span>
//             </>
//           )}
//         </h5>
//       </div>

//       <div className="p-3 border rounded" style={{ minHeight: 50 }}>
//         {questions.length === 0 ? (
//           <div className="text-muted fst-italic">
//             Aucune question dans cette section
//           </div>
//         ) : (
//           <QuestionList
//             questions={questions}
//             onDelete={onDeleteQuestion}
//             onUpdate={onUpdateQuestion}
//             disabled={disabled}
//           />
//         )}
//       </div>
//     </div>
//   );
// };
// export default SectionBlock;

// ========================================
// import React from "react";
// import { Section } from "../../services/sectionService";
// import { Question } from "../../services/questionService";
// import QuestionList from "../questions/QuestionList";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// interface Props {
//   section: Section | null; // null = questions non assignées
//   questions: Question[];
//   onDeleteQuestion: (id: string) => void;
//   onUpdateQuestion: (id: string, data: Partial<Question>) => void;
//   disabled?: boolean;
// }

// /**
//  * 🔹 SectionBlock
//  * - Affiche une section (ou "Questions sans section")
//  * - Contient la liste des questions associées
//  * - Réutilise QuestionList (DnD géré plus haut)
//  */
// const SectionBlock: React.FC<Props> = ({
//   section,
//   questions,
//   onDeleteQuestion,
//   onUpdateQuestion,
//   disabled,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: section ? `section-${section.id}` : "section-unassigned",
//       disabled: section === null,
//     });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="mb-4 border rounded">
//       {/* <div className="mb-4"> */}

//       {/* ===== HEADER SECTION ===== */}
//       <div className="d-flex align-items-center justify-content-between mb-2">
//         {section && (
//           <span
//             {...attributes}
//             {...listeners}
//             style={{ cursor: "grab" }}
//             className="me-2"
//           >
//             ⠿
//           </span>
//         )}
//         <h5 className="mb-0">
//           {section ? (
//             <>
//               📂 {section.title}
//               <span className="badge bg-secondary ms-2">
//                 {questions.length}
//               </span>
//             </>
//           ) : (
//             <>
//               🗂️ Questions sans section
//               <span className="badge bg-warning text-dark ms-2">
//                 {questions.length}
//               </span>
//             </>
//           )}
//         </h5>
//       </div>

//       {/* ===== CONTENU ===== */}
//       <div
//         className="p-3 border rounded"
//         style={{
//           background: "#fdfdfd",
//           minHeight: 50,
//         }}
//       >
//         {questions.length === 0 ? (
//           <div className="text-muted fst-italic">
//             Aucune question dans cette section
//           </div>
//         ) : (
//           <QuestionList
//             questions={questions}
//             onDelete={onDeleteQuestion}
//             onUpdate={onUpdateQuestion}
//             disabled={disabled}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SectionBlock;
