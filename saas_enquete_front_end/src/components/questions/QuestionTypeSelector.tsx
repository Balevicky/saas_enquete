// import { QuestionType } from "../../services/questionService";

import { QuestionType } from "../../types/question";

interface Props {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

const QuestionTypeSelector = ({ value, onChange }: Props) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as QuestionType)}
    >
      <option value="TEXT">Texte court</option>
      <option value="TEXTAREA">Texte long</option>
      <option value="NUMBER">Nombre</option>
      <option value="DATE">Date</option>
      <option value="EMAIL">Email</option>
      <option value="PHONE">Téléphone</option>
      <option value="SINGLE_CHOICE">Choix unique</option>
      <option value="MULTIPLE_CHOICE">Choix multiple</option>
      <option value="SCALE">Échelle</option>
    </select>
  );
};

export default QuestionTypeSelector;
