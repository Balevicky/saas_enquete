// src/components/responses/QuestionRenderer.tsx
import React from "react";
import AnswerInput from "./AnswerInput";
import { QuestionType } from "../../types/question";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface Props {
  question: Question;
  value: any;
  onChange: (questionId: string, value: any) => void;
}

const QuestionRenderer = ({ question, value, onChange }: Props) => {
  return (
    <div className="mb-3">
      <label className="form-label">{question.text}</label>
      <AnswerInput
        type={question.type}
        value={value}
        options={question.options}
        onChange={(val) => onChange(question.id, val)}
      />
    </div>
  );
};

export default QuestionRenderer;
