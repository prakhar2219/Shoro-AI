export interface MCQOption {
  key: string;
  text: string;
}

export interface MCQ {
  _id: string;
  question: string;
  options: MCQOption[];
  correct_answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface ServerMCQSectionProps {
  mcqs: MCQ[];
  title: string;
  description: string;
}
