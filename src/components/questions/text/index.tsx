import { Button, Radio } from "antd";
import React from "react";
import styles from "./styles.module.css";
interface QuestionTextProps {
  field: any;
  index: number;
  handleFormChange: (index: number, event: any) => void;
  visible: boolean;
  handleQuestionTextChange: (index: number, event: any) => void;
  handleRemoveImg: (index: number) => void;
  dragProp: any;
  dragging: number;
}

export function QuestionText({
  field,
  index,
  handleFormChange,
  visible,
  handleQuestionTextChange,
  handleRemoveImg,
  dragProp,
  dragging,
}: QuestionTextProps) {
  return (
    <div
      key={index}
      className={
        dragging === index
          ? styles.alternativeContainerDragging
          : visible
          ? styles.alternativeContainerSelected
          : styles.alternativeContainer
      }
    >
      <div className={styles.drag} {...dragProp}>
        <img src="/drag.svg" alt="ícone de drag" />
      </div>
      <div className={styles.alternativeContainerLeft}>
        <div className={styles.headerQuestion}>
          <input
            name="title"
            placeholder="Título da pergunta"
            value={field.title}
            onChange={(event) => handleFormChange(index, event)}
            className={
              dragging === index ? styles.titleInputDragging : styles.titleInput
            }
          />
          {field.mandatory && <p className={styles.required}>*</p>}
        </div>
      </div>
      <div>
        {field.image && (
          <div className={styles.imgDiv}>
            <img
              src={field.image}
              alt="Imagem da pergunta"
              className={styles.img}
            />
            <Button
              onClick={() => handleRemoveImg(index)}
              className={styles.deleteAlternativeImg}
              type="text"
            >
              <img
                src="/exclude.svg"
                alt="Excluir alternativa"
                className={styles.deleteIconImg}
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
