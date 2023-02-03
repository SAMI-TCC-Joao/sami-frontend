import { Radio } from "antd";
import React from "react";
import styles from "./styles.module.css";
import TextareaAutosize from "react-textarea-autosize";

interface ResponseTextProps {
  field: any;
  indexQuestion: number;
  handleQuestionTextChange: (index: number, event: any) => void;
  isTeacher?: boolean;
}

export function ResponseText({
  field,
  indexQuestion,
  handleQuestionTextChange,
  isTeacher,
}: ResponseTextProps) {

  return (
    <div key={indexQuestion} className={styles.textContainer}>
      <div className={styles.textContainerLeft}>
        <div className={styles.headerQuestion}>
          <p className={styles.titleInput}>{field.title}</p>
          {field.mandatory && <p className={styles.required}>*</p>}
        </div>

        <div className={styles.body}>
        <TextareaAutosize
          name="textResponse"
          placeholder="Escreva aqui"
          value={field.options?.textResponse}
          onChange={(event) => handleQuestionTextChange(indexQuestion, event)}
          className={styles.textArea}
          disabled={isTeacher}
        />
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
