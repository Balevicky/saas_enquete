import React from "react";
import { QuestionType } from "../../types/question";

const QuestionPreview = ({
  label,
  type,
  options,
  config,
  nextMap,
}: {
  label: string;
  type: QuestionType;
  options?: string[];
  config?: { min: number; max: number };
  nextMap?: Record<string, string>;
}) => {
  return (
    <div className="p-2 border rounded mb-2" style={{ background: "#fff" }}>
      <strong>{label}</strong>

      <div className="mt-1">
        {type === "TEXT" && (
          <input
            type="text"
            className="form-control"
            placeholder="Réponse..."
            // disabled
          />
        )}

        {type === "TEXTAREA" && (
          <textarea
            className="form-control"
            placeholder="Réponse..."
            // disabled
          />
        )}

        {type === "NUMBER" && (
          <input type="number" className="form-control" disabled />
        )}

        {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
          options?.map((opt, i) => (
            <div key={i} className="form-check">
              <input
                className="form-check-input"
                type={type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                name="preview"
                id={`opt-${i}`}
                // disabled
              />
              <label className="form-check-label" htmlFor={`opt-${i}`}>
                {opt}
              </label>
            </div>
          ))}

        {type === "SCALE" && (
          <input
            type="range"
            className="form-range"
            min={config?.min ?? 1}
            max={config?.max ?? 5}
            // disabled
          />
        )}

        {/* ✅ AJOUTS DEMANDÉS */}

        {type === "DATE" && (
          <input type="date" className="form-control" disabled />
        )}

        {type === "EMAIL" && (
          <input
            type="email"
            className="form-control"
            placeholder="exemple@email.com"
            // disabled
          />
        )}

        {type === "PHONE" && (
          <input
            type="tel"
            className="form-control"
            placeholder="+245 xx xxx xxxx"
            // disabled
          />
        )}
      </div>
    </div>
  );
};

export default QuestionPreview;

// ================================== pas bon il manque date ,email et telephone
// import React from "react";
// import { QuestionType } from "../../types/question";

// const QuestionPreview = ({
//   label,
//   type,
//   options,
//   config,
//   nextMap,
// }: {
//   label: string;
//   type: QuestionType;
//   options?: string[];
//   config?: { min: number; max: number };
//   nextMap?: Record<string, string>;
// }) => {
//   return (
//     <div className="p-2 border rounded mb-2" style={{ background: "#fff" }}>
//       <strong>{label}</strong>
//       <div className="mt-1">
//         {type === "TEXT" && (
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Réponse..."
//           />
//         )}
//         {type === "TEXTAREA" && (
//           <textarea
//             className="form-control"
//             placeholder="Réponse..."
//           ></textarea>
//         )}
//         {type === "NUMBER" && <input type="number" className="form-control" />}
//         {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
//           options?.map((opt, i) => (
//             <div key={i} className="form-check">
//               <input
//                 className="form-check-input"
//                 type={type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
//                 name="preview"
//                 id={`opt-${i}`}
//               />
//               <label className="form-check-label" htmlFor={`opt-${i}`}>
//                 {opt}
//               </label>
//             </div>
//           ))}
//         {type === "SCALE" && (
//           <input
//             type="range"
//             className="form-range"
//             min={config?.min ?? 1}
//             max={config?.max ?? 5}
//           />
//         )}
//       </div>
//     </div>
//   );
// };
// export default QuestionPreview;
