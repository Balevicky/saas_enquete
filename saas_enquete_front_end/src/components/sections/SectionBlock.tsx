import React from "react";
import { Section } from "../../services/sectionService";
import { Question } from "../../services/questionService";
import QuestionList from "../questions/QuestionList";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  section: Section | null; // null = questions sans section
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, data: Partial<Question>) => void;
  disabled?: boolean;
  children?: React.ReactNode; // ✅ pour inclure des enfants directement si nécessaire
}

const SectionBlock: React.FC<Props> = ({
  section,
  questions,
  onDeleteQuestion,
  onUpdateQuestion,
  disabled,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: section ? `section-${section.id}` : "section-unassigned",
      disabled: section === null,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-4 border rounded shadow-sm"
    >
      <div className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light">
        {/* {section && (
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: "grab" }}
            className="me-2"
          >
            ⠿
          </span>
        )} */}
        <h5 className="mb-0">
          {section
            ? // ? `📂 ${section.title ?? section.name}`
              `📂 ${section.title}`
            : `🗂️ Questions sans section`}
          <span
            className={`badge ms-2 ${
              section ? "bg-secondary" : "bg-warning text-dark"
            }`}
          >
            {questions.length}
          </span>
        </h5>
      </div>

      <div className="p-2">
        {children ? (
          children
        ) : questions.length === 0 ? (
          <div className="text-muted fst-italic">
            Aucune question dans cette section
          </div>
        ) : (
          <QuestionList
            questions={questions}
            onDelete={onDeleteQuestion}
            onUpdate={onUpdateQuestion}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default SectionBlock;

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
