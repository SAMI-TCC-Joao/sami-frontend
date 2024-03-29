import React from "react";
import styles from "./styles.module.css";
import { ResponseAlternative } from "./alternative";
import { ResponseMultipleChoice } from "./multipleChoice";
import { ResponseText } from "./text";
import { ResponseLikert } from "./likert";

interface QuestionResponseProps {
  evaluation: any;
  setEvaluation: (evaluation: any) => void;
  isTeacher?: boolean;
}

export function QuestionResponse({ evaluation, setEvaluation, isTeacher }: QuestionResponseProps) {

  const handleQuestionChange = (index: number, data: any) => {
    // alternatives, likert e multipleChoice
    let copyQuestion = { ...evaluation };
    copyQuestion.form.questions[index].options.alternatives = data;
    setEvaluation(copyQuestion);
  };

  const handleQuestionTextChange = (index, event) => {
    // textResponse
    let copyQuestion = { ...evaluation };
    copyQuestion.form.questions[index].options.textResponse = event.target.value;
    setEvaluation(copyQuestion);
  };

  return (
    <div className={styles.container}>
      {evaluation?.form?.questions?.map((question, index) => {
        switch (question.type) {
          case "alternative":
            return (
              <ResponseAlternative
                field={question}
                indexQuestion={index}
                handleQuestionChange={handleQuestionChange}
                isTeacher={isTeacher}
              />
            );
          case "text":
            return (
              <ResponseText
                field={question}
                indexQuestion={index}
                handleQuestionTextChange={handleQuestionTextChange}
                isTeacher={isTeacher}
              />
              );
          case "likert":
            return (
            <ResponseLikert
                field={question}
                indexQuestion={index}
                handleQuestionChange={handleQuestionChange}
                isTeacher={isTeacher}
              />
            );
          case "multipleChoice":
            return (
            <ResponseMultipleChoice
                field={question}
                indexQuestion={index}
                handleQuestionChange={handleQuestionChange}
                isTeacher={isTeacher}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
