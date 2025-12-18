import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Question } from "../../services/questionService";

interface Props {
  question: Question;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const QuestionItem = ({ question, onDelete, disabled }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 250ms cubic-bezier(0.2, 0, 0, 1)", // 🎯 FLUIDE
    // transition,
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    border: "1px solid #ddd",
    background: isDragging ? "#e8eaf2ca" : "#fff", // 🔵 FOND BLEU SI DRAG
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
    // border: isDragging ? "2px solid #f2f3f6ff" : "1px solid #ddd",
    opacity: isDragging ? 0.9 : 1,
    willChange: "transform", // 🚀 perf
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: disabled ? "default" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>
        {question.position}. {question.label} ({question.type})
      </span>

      {!disabled && <button onClick={() => onDelete(question.id)}>❌</button>}
    </div>
  );
};

export default QuestionItem;

// ====================================== BON
// import { CSS } from "@dnd-kit/utilities";
// import { useSortable } from "@dnd-kit/sortable";
// import { Question } from "../../services/questionService";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
//   disabled?: boolean;
// }

// const QuestionItem = ({ question, onDelete, disabled }: Props) => {
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
//     cursor: disabled ? "default" : "grab",
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

// export default QuestionItem;

// =========================================
// import React from "react";
// import { Question } from "../../services/questionService";

// interface QuestionItemProps {
//   question: Question;
//   onDelete: (id: string) => void;
//   disabled?: boolean;
// }

// const QuestionItem: React.FC<QuestionItemProps> = ({
//   question,
//   onDelete,
//   disabled = false,
// }) => {
//   return (
//     <div
//       style={{
//         border: "1px solid #ddd",
//         padding: 12,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         background: "#fff",
//         borderRadius: 4,
//       }}
//     >
//       <div>
//         <strong>
//           {question.position}. {question.label}
//         </strong>{" "}
//         ({question.type})
//       </div>
//       <button
//         onClick={() => onDelete(question.id)}
//         disabled={disabled}
//         style={{ marginLeft: 12, color: "red" }}
//       >
//         ❌
//       </button>
//     </div>
//   );
// };

// export default QuestionItem;

// ===============================
// import { Question } from "../../services/questionService";

// interface Props {
//   question: Question;
//   onDelete: (id: string) => void;
// }

// const QuestionItem = ({ question, onDelete }: Props) => {
//   return (
//     <li className="border p-2 mb-2 d-flex justify-content-between">
//       <div>
//         <strong>
//           {question.position}. {question.label}
//         </strong>
//         <div className="text-muted">{question.type}</div>
//       </div>

//       <button
//         className="btn btn-sm btn-danger"
//         onClick={() => onDelete(question.id)}
//       >
//         ❌
//       </button>
//     </li>
//   );
// };

// export default QuestionItem;
