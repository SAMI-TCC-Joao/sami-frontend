import { Radio } from "antd";
import React from "react";
import styles from "./styles.module.css";

interface ResponseLikertProps {
  field: any;
  indexQuestion: number;
  handleQuestionChange: (index: number, question: any) => void;
}

export function ResponseLikert({
  field,
  indexQuestion,
  handleQuestionChange,
}: ResponseLikertProps) {
  const checkAlternative = (column: any, indexLine: number) => {
    let data = { ...field.options };
    data.lines[indexLine] = {
      ...data.lines[indexLine],
      response: column.id,
    };
    handleQuestionChange(indexQuestion, data);
  };

  return (
    <div key={indexQuestion} className={styles.likertContainer}>
      <div className={styles.likertContainerLeft}>
        <div className={styles.headerQuestion}>
          <p className={styles.titleInput}>{field.title}</p>
          {field.mandatory && <p className={styles.required}>*</p>}
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

        <div className={styles.body}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.thTable}>
                <th></th>
                {field.options.columns?.map(
                  (column: any, indexQuestion: number) => {
                    return (
                      <th key={indexQuestion}>
                          <p className={styles.likertBody}>{column.value}</p>
                      </th>
                    );
                  }
                )}
              </tr>
            </thead>
            <tbody>
              {field.options.lines?.map((row: any, indexLine: number) => {
                return (
                  <tr key={indexLine} className={styles.thTable}>
                    <td>
                      <p className={styles.likertBody}>{row.value}</p>
                    </td>
                    {field.options.columns?.map(
                      (column: any, indexQuestion: number) => {
                        return (
                          <td
                            key={indexQuestion}
                            className={styles.tdContainer}
                          >
                            <Radio
                              className={styles.likertBody}
                              checked={row.response === column.id}
                              onChange={(event) =>
                                checkAlternative(column, indexLine)
                              }
                            />
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
