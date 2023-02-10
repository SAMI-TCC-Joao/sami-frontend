import { Modal } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { appRoutes } from "../../../constants";
import { IndicatorModal } from "../indicatorModal";
import styles from "./styles.module.css";

interface TitlePageProps {
  title: string;
  url?: string;
  isIndicator?: boolean;
  isIndicatorEdit?: boolean;
  nameIndicator?: string;
  isStudent?: boolean;
  indicatorId?: string;
  hideButton?: boolean;
  handleEditIndicator?: (e: any, name: string) => void;
  handleUpdateIndicator?: () => void;
}

export function TitlePage({
  title,
  url,
  isIndicator,
  isIndicatorEdit,
  isStudent,
  nameIndicator,
  indicatorId,
  hideButton,
  handleEditIndicator,
  handleUpdateIndicator,
}: TitlePageProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (isIndicator) {
      showModal();
      return;
    }

    router.push(url || "");
  };

  return (
    <div className={styles.title}>
      {isIndicatorEdit ? (
        <div className={styles.titleDiv}>
          <input
            className={styles.titleIndicatorName}
            value={nameIndicator}
            onChange={(e) => handleEditIndicator?.(e, "name")}
            placeholder="Nome do indicador"
          />
          <p
            className={styles.details}
            onClick={() =>
              router.push(
                appRoutes.analysesIndicator.replace(
                  "[index]",
                  indicatorId || ""
                )
              )
            }
          >
            Ver detalhes e estatísticas
          </p>
        </div>
      ) : (
        <>{nameIndicator || title}</>
      )}
      {hideButton ? null : isIndicatorEdit ? (
        <button className={styles.button} onClick={handleUpdateIndicator}>
          Salvar
        </button>
      ) : isStudent ? null : (
        <button className={styles.button} onClick={() => handleCreate()}>
          Criar
        </button>
      )}
      {isIndicator && (
        <IndicatorModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
}
