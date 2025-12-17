import React from "react";
import { Question } from "../../services/questionService";

interface QuestionItemProps {
  question: Question;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  onDelete,
  disabled = false,
}) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        borderRadius: 4,
      }}
    >
      <div>
        <strong>
          {question.position}. {question.label}
        </strong>{" "}
        ({question.type})
      </div>
      <button
        onClick={() => onDelete(question.id)}
        disabled={disabled}
        style={{ marginLeft: 12, color: "red" }}
      >
        ❌
      </button>
    </div>
  );
};

export default QuestionItem;

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
