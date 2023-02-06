import { Checkbox } from "antd";
import React from "react";
import styles from "./styles.module.css";

interface ResponseMultipleChoiceProps {
  field: any;
  indexQuestion: number;
  handleQuestionChange: (index: number, question: any) => void;
  isTeacher?: boolean;
}

export function ResponseMultipleChoice({
  field,
  indexQuestion,
  handleQuestionChange,
  isTeacher,
}: ResponseMultipleChoiceProps) {
  const checkAlternative = (index2: number, event: any) => {
    let data = [...field.options.alternatives];
    data[index2].correct = event.target.checked;
    handleQuestionChange(indexQuestion, data);
  };

  return (
    <div key={indexQuestion} className={styles.alternativeContainer}>
      <div className={styles.alternativeContainerLeft}>
        <div className={styles.headerQuestion}>
          <p className={styles.titleInput}>{field.title}</p>
          {field.mandatory && <p className={styles.required}>*</p>}
        </div>

        <div className={styles.body}>
          {field.options.alternatives?.map(
            (alternative: any, indexAlternative: number) => {
              return (
                <Checkbox
                  key={indexAlternative}
                  className={styles.alternativeBody}
                  checked={alternative.correct}
                  disabled={isTeacher}
                  onChange={(event) =>
                    checkAlternative(indexAlternative, event)
                  }
                >
                  {alternative.value}
                </Checkbox>
              );
            }
          )}
        </div>
      </div>

      <div>
        {field.image && (
          <div className={styles.imgDiv}>
            <img
              src={field.image}
              className={styles.img}
              alt="Imagem da pergunta"
            />
          </div>
        )}
      </div>
    </div>
  );
}
