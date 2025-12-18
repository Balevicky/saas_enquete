// src/components/responses/AnswerInput.tsx
import React from "react";
import { QuestionType } from "../../types/question";

interface Props {
  type: QuestionType;
  value: any;
  onChange: (value: any) => void;
  options?: string[]; // pour SINGLE_CHOICE / MULTIPLE_CHOICE
}

const AnswerInput = ({ type, value, onChange, options }: Props) => {
  switch (type) {
    case "TEXT":
    case "EMAIL":
    case "PHONE":
    case "NUMBER":
    case "DATE":
      return (
        <input
          className="form-control"
          type={type.toLowerCase()}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "TEXTAREA":
      return (
        <textarea
          className="form-control"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "SINGLE_CHOICE":
      return (
        <div>
          {options?.map((opt) => (
            <div className="form-check" key={opt}>
              <input
                className="form-check-input"
                type="radio"
                name="singleChoice"
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <label className="form-check-label">{opt}</label>
            </div>
          ))}
        </div>
      );

    case "MULTIPLE_CHOICE":
      return (
        <div>
          {options?.map((opt) => (
            <div className="form-check" key={opt}>
              <input
                className="form-check-input"
                type="checkbox"
                value={opt}
                checked={value?.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...(value || []), opt]);
                  } else {
                    onChange((value || []).filter((v: string) => v !== opt));
                  }
                }}
              />
              <label className="form-check-label">{opt}</label>
            </div>
          ))}
        </div>
      );

    case "SCALE":
      return (
        <input
          type="range"
          className="form-range"
          min={1}
          max={5}
          value={value || 3}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );

    default:
      return null;
  }
};

export default AnswerInput;
