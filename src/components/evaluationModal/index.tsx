import { Modal, Checkbox, Select, DatePicker, Tooltip } from "antd";
import { useRouter } from "next/router";
import { InfoCircleOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useCRUD from "../hooks/useCRUD";
import styles from "./styles.module.css";
import ReactTextareaAutosize from "react-textarea-autosize";
import dayjs from "dayjs";

const weekDays = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sab',
  sunday: 'Dom',
}

interface EvaluationModalProps {
  evaluationData: any;
  formId: string;
  indicatorId: string;
  handleReload: () => void;
  setEvaluationModal: (value: boolean) => void;
  formName: string;
}

export function EvaluationModal({
  evaluationData,
  formId,
  indicatorId,
  handleReload,
  setEvaluationModal,
  formName,
}: EvaluationModalProps) {
  const router = useRouter();

  const { user } = useSelector((state: any) => state);
  const { handleGet: handleGetClasses } = useCRUD({ model: "classe" });
  const { handleCreate: handleCreateEvaluation, handleUpdate: handleUpdateEvaluation } = useCRUD({ model: "evaluation" });
  const [firstVerify, setFirstVerify] = useState(false);
  const [classes, setClasses] = useState([] as any);
  const [shouldRepeat, setShouldRepeat] = useState(evaluationData.shouldRepeat as boolean);
  const [evaluation, setEvaluation] = useState({
    id: undefined,
    formId,
    indicatorId,
    classId: "",
    initialDate: "",
    finalDate: "",
    description: "",
    repeat: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    ...evaluationData,
    shouldRepeat: false,
  });

  const handleOk = () => {
    if (!evaluation.classId) {
      toast.error("Selecione uma turma");
      setFirstVerify(true);
      return;
    }

    if (!evaluation.initialDate) {
      toast.error("Selecione uma data inicial");
      setFirstVerify(true);
      return;
    }

    if (!evaluation.finalDate) {
      toast.error("Selecione uma data final");
      setFirstVerify(true);
      return;
    }

    const { id, ..._evaluation } = evaluation;
    const func = id ? handleUpdateEvaluation : handleCreateEvaluation
    func({
      id,
      values: {..._evaluation, shouldRepeat: shouldRepeat ?? false },
    }).then(({ data, error }) => {
      if (error) {
        toast.error(`Erro ao ${id ? 'atualizar' : 'criar'} aplicação`);
        return;
      }

      toast.success(`Aplicação ${id ? 'atualizada' : 'criada'} criada com sucesso`);
      setEvaluation({
        id: undefined,
        formId: "",
        indicatorId: "",
        classId: "",
        initialDate: "",
        finalDate: "",
        description: "",
        repeat: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        },
        shouldRepeat: false,
      });
      handleReload();
      setEvaluationModal(false);
    });
  };

  const handleCancel = () => {
    setEvaluationModal(false);
    setFirstVerify(false);
    setEvaluation({
      id: undefined,
      formId: "",
      indicatorId: "",
      classId: "",
      initialDate: "",
      finalDate: "",
      description: "",
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      shouldRepeat: false,
    });
  };

  useEffect(() => {
    if (!router.isReady || !evaluationData) return;
    handleGetClasses({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao buscar turmas");
        return;
      }

      setClasses(data);

      setEvaluation({
        ...evaluation,
        ...evaluationData,
        formId,
        indicatorId,
      });
    });
  }, [evaluationData]);

  return (
    <Modal
      open={!!evaluationData}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={"Adicionar"}
      cancelText="Cancelar"
      title={"Adicionar aplicação"}
      width={700}
      bodyStyle={{ padding: "0 1.2rem 1rem 1.2rem" }}
    >
      <div className={styles.lineFlex}>
        <div className={styles.divFlex}>
          <span className={styles.title}>Formulário: </span>
          <span>{formName}</span>
        </div>
        <div className={styles.divFlex}>
        <span
            className={
              firstVerify && !evaluation.classId
                ? styles.titleError
                : styles.title
            }
          >
            Turma:{" "}
          </span>
          <Select
            showSearch
            placeholder="Selecione a turma"
            filterOption={(input, option) =>
              `${option?.label ?? ""}`
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            className={
              firstVerify && !evaluation.classId
                ? styles.selectError
                : styles.select
            }
            options={classes.map((classe: any) => ({
              value: classe.id,
              label: classe.name,
            }))}
            value={evaluation.classId}
            onChange={(value) =>
              setEvaluation({ ...evaluation, classId: value })
            }
          />
        </div>
      </div>
      <div className={styles.divFlexRange}>
      <span
          className={
            firstVerify && !evaluation.initialDate && !evaluation.finalDate
              ? styles.titleError
              : styles.title
          }
        >
          Período:{" "}
        </span>
        <DatePicker.RangePicker
          showTime
          onChange={(value, valueString) =>
            setEvaluation({
              ...evaluation,
              initialDate: new Date(`${value?.[0]}`).toISOString(),
              finalDate: new Date(`${value?.[1]}`).toISOString(),
            })
          }
          value={[evaluation.initialDate?.length ? dayjs(evaluation.initialDate) : null, evaluation.finalDate?.length ? dayjs(evaluation.finalDate) : null]}
          placeholder={["Escolha a data inicial", "Escolha a data final"]}
          className={
            firstVerify && !evaluation.initialDate && !evaluation.finalDate
              ? styles.datePickerError
              : styles.datePicker
          }
        />
      </div>
      <div className={styles.descriptionDiv}>
        <span className={styles.title}>Observações: </span>
        <ReactTextareaAutosize
          placeholder="Escreva aqui as observações..."
          className={styles.textArea}
          value={evaluation.description}
          onChange={(e) =>
            setEvaluation({ ...evaluation, description: e.target.value })
          }
        />
      </div>
      <div className={styles.weekDiv}>
        <div className={styles.weekTitleDiv}>
        <span className={styles.title}>
          Repetir
        </span>
        <Checkbox
              checked={shouldRepeat}
              onChange={(e) =>
                setShouldRepeat( e.target.checked)
              }
            />
            <Tooltip title="Ao ativar essa opção, a aplicação irá verificar apenas os dias da semana marcados abaixo e irá ignorar as datas de início e fim selecionadas">
            <InfoCircleOutlined />
            </Tooltip>
        </div>
        
        <div className={styles.checkboxContainer}>
          {Object.entries(weekDays).map(([key,value]) => (
            <div className={styles.checkboxDiv} key={`div-weekday-${key}`}>
            <span>{value}</span>
            <Checkbox
              key={`checkbox-weekday-${key}`}
              checked={evaluation.repeat[key]}
              disabled={!shouldRepeat}
              onChange={(e) =>
                setEvaluation({
                  ...evaluation,
                  repeat: {
                    ...evaluation.repeat,
                    [key]: e.target.checked,
                  },
                })
              }
            />
          </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
