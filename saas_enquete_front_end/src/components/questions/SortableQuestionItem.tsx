import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Question } from "../../services/questionService";
import React, { ReactNode } from "react";

interface Props {
  question: Question;
  onDelete: (id: string) => void;
  disabled?: boolean;
  renderExtra?: (q: Question) => ReactNode;
}

const SortableQuestionItem = ({
  question,
  onDelete,
  disabled,
  renderExtra,
}: Props) => {
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
    padding: 12,
    marginBottom: 8,
    border: "1px solid #ddd",
    borderRadius: 4,
    background: isDragging ? "#f5f2ecff" : "#fff", // ← couleur de drag
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.2)" : "none", // optionnel : un peu de relief
    cursor: isDragging ? "grabbing" : "grab", // visuel du curseur
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>
        {question.position}. {question.label} ({question.type})
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {renderExtra && renderExtra(question)}
        {!disabled && <button onClick={() => onDelete(question.id)}>❌</button>}
      </div>
    </div>
  );
};

export default SortableQuestionItem;

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
