import { Table, Dropdown, Tooltip, Modal } from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { formsUpdate } from "../../../../store/actions/forms";
import useCRUD from "../../hooks/useCRUD";
import styles from "./styles.module.css";
import { appRoutes } from "../../../../constants";
import { EvaluationModal } from "../../evaluationModal";

interface IndicatorTableProps {
  data: any;
  id: string;
  setIndicator: (value: any) => void;
}

export function IndicatorTable({
  data,
  id,
  setIndicator,
}: IndicatorTableProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [dataTable, setDataTable] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [informationModal, setInformationModal] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [isDeleteEvaluation, setIsDeleteEvaluation] = useState("" as any);
  const [evaluationModal, setEvaluationModal] = useState(null as any);

  const { forms, user } = useSelector((state: any) => state);
  const { handleGet: handleGetForms } = useCRUD({ model: "form" });
  const { handleCreate: handleCreateIndicator } = useCRUD({
    model: "indicator",
  });
  const { handleDelete: handleDeleteEvaluation } = useCRUD({ model: "evaluation" });

  const { handleGet: handleGetIndicator } = useCRUD({
    model: "indicator/one",
  });
  const { handleDelete: handleDeleteForm } = useCRUD({ model: "form" });

  const dataDropdown = (type: string) => {
    switch(type){
      case "form":
        return [
          { label: "Ver detalhes (editar)", key: "Ver detalhes-form" },
          { label: "Aplicar", key: "Reaplicar-form" },
          { label: "Excluir", key: "Excluir-form", danger: true },
        ];
        break;
      case "evaluation":
      return [
        { label: "Ver detalhes (Editar)", key: "Ver detalhes-evaluation" },
        { label: "Agendar", key: "Agendar-evaluation" },
        { label: "Excluir", key: "Excluir-evaluation", danger: true },
      ];
      default: return [];
    }


  };

  const dropdownData = (type: string) => {
    if (type === "form") {
      const formData = forms.forms?.map((form: any) => {
        return { label: form.name, key: form.id };
      });

      return [
        {
          label: "Formulários disponíveis:",
          key: "Formulários disponíveis-form",
          disabled: true,
        },
        ...formData,
      ];
    }

    return [
      {
        label: "Não implementado",
        key: "Formulários disponíveis-form",
        disabled: true,
      },
    ];
  };

  const handleDelete = () => {
    handleDeleteForm({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${formId}`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao apagar formulário");
        return;
      }
      toast.success("Formulário apagado com sucesso");
      handleGetIndicator({
        header: {
          Authorization: `Bearer ${user.token}`,
        },
        refetchPathOptions: `${id}`,
      }).then(({ data, error }) => {
        setIndicator(data);
        setDeleteModal(false);
        handleFormsFunction();
        setIsModalOpen(false);
      });
    });
  };

  const deleteEvaluation = (evaluationId) => {
    handleDeleteEvaluation({
      refetchPathOptions: `${evaluationId}`,
    }).then(({ error }) => {
      if (error) {
        toast.error("Erro ao apagar aplicação");
        return;
      }
      toast.success("Aplicação apagada com sucesso");
      setIsDeleteEvaluation(null);
    });
  }

  const handleFormsFunction = () => {
    handleGetForms({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao buscar formulários");
        return;
      }
      dispatch(formsUpdate(data));
    });
  };

  const handleMenu = (
    menuType: string,
    option: string,
    dataId: string,
    dataName: string,
    extra: any
  ) => {
    if (option === "form-add") {
      setIsModalOpen(true);
      setInformationModal(menuType);
    }

    const menuTypeSplitArray = menuType.split("-");

    if (menuTypeSplitArray[1] === "evaluation") {
      switch (menuTypeSplitArray[0]) {
        case "Ver detalhes":
          setFormId(extra.form.id);
          setFormName(dataName);
          setEvaluationModal(extra);
          break;
        case "Agendar":
          setFormId(extra.form.id);
          setFormName(dataName);
          setEvaluationModal({});
          break;
        case "Excluir":
          setIsDeleteEvaluation(dataId);
          break;
        default:
          toast.error("Erro inesperado");
          break;
      }
    }

    if (menuTypeSplitArray[1] === "form") {
      switch (menuTypeSplitArray[0]) {
        case "Ver detalhes":
          router.push(
            `${appRoutes.updateForm.replace("[index]", dataId)}?indicator=${id}`
          );
          break;
        case "Reaplicar":
          setFormId(dataId);
          setFormName(dataName);
          setEvaluationModal({});
          break;
        case "Excluir":
          setFormId(dataId);
          setDeleteModal(true);
          setIsModalOpen(true);
          break;
        default:
          toast.error("Erro inesperado");
          break;
      }
    }
  };

  const handleDataSource = () => {
    const dataSource = data.map((item: any, index: number) => {
      return {
        key: index,
        name: (
          <div className={styles.nameContainer}>
            {item.name}
            <Tooltip title="Adicionar aplicação">
              <img
                src="/add-layer.svg"
                alt="adicionar aplicação"
                className={styles.addLayer}
                onClick={() => {
                  setFormId(item.id);
                  setFormName(item.name);
                  setEvaluationModal({});
                }}
              />
            </Tooltip>
          </div>
        ),
        ...(item.evaluation?.length > 0 && {
          children: item.evaluation?.map((evaluation: any, index: number) => {
            return {
              key: evaluation.id,
              name: `Aplicação ${index + 1}`,
              class: evaluation.class.name,
              date: new Date(evaluation.createdAt).toLocaleDateString(),
              views: evaluation.responses,
              status:
                new Date(evaluation.finalDate) > new Date() || evaluation.shouldRepeat
                  ? "Em andamento"
                  : "Finalizado",
              actions: (
                <Dropdown
                  arrow
                  trigger={["click"]}
                  menu={{
                    items: dataDropdown("evaluation"),
                    onClick: (e) =>
                      handleMenu(e.key, "evaluation", evaluation.id, evaluation.form.name, evaluation),
                  }}
                >
                  <img
                    src="/more.svg"
                    alt="ver mais"
                    className={styles.moreIcon}
                  />
                </Dropdown>
              ),
            };
          }),
        }),
        actions: (
          <Dropdown
            arrow
            trigger={["click"]}
            menu={{
              items: dataDropdown("form"),
              onClick: (e) => handleMenu(e.key, "form", item.id, item.name, null),
            }}
          >
            <img src="/more.svg" alt="ver mais" className={styles.moreIcon} />
          </Dropdown>
        ),
      };
    });

    dataSource.push({
      key: "new",
      name: (
        <div className={styles.newContainer}>
          <Dropdown
            arrow
            trigger={["click"]}
            menu={{
              items: dropdownData("form"),
              onClick: (e) => handleMenu(e.key, "form-add", ""),
            }}
          >
            <img
              src="/add-layer.svg"
              alt="adicionar formulário"
              className={styles.addLayer}
            />
          </Dropdown>
          <span className={styles.newContainerSpan}>Adicionar formulário</span>
        </div>
      ),
    });

    setDataTable(dataSource);
  };

  useEffect(() => {
    handleDataSource();
  }, [data]);

  const handleOk = () => {
    handleFormsFunction();

    handleCreateIndicator({
      values: { formsId: [informationModal] },
      header: { Authorization: `Bearer ${user.token}` },
      refetchPathOptions: `add/${id}`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao adicionar formulário");
        return;
      }
      toast.success("Formulário adicionado com sucesso");
      handleGetIndicator({
        header: {
          Authorization: `Bearer ${user.token}`,
        },
        refetchPathOptions: `${id}`,
      }).then(({ data, error }) => {
        setIndicator(data);
        setIsModalOpen(false);
      });
    });
  };

  const handleReload = () => {
    handleGetIndicator({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${id}`,
    }).then(({ data, error }) => {
      setIndicator(data);
    });
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      width: "40%",
    },
    {
      title: "Turma",
      dataIndex: "class",
      key: "class",
      width: "15%",
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      width: "15%",
    },
    {
      title: "Respostas",
      dataIndex: "views",
      key: "views",
      width: "15%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
    },
  ];

  return (
    <div className={styles.tableContainer}>
      <Table dataSource={[...dataTable]} columns={columns} pagination={false} />
      <Modal
        open={isModalOpen}
        onOk={deleteModal ? handleDelete : handleOk}
        onCancel={handleCancel}
        okText={deleteModal ? "Apagar" : "Copiar"}
        cancelText="Cancelar"
        title={deleteModal ? "Apagar formulário" : "Copiar formulário?"}
        width={700}
        bodyStyle={{ padding: "0 1.2rem 1rem 1.2rem" }}
      >
        {deleteModal ? (
          <span>
            Essa ação não pode ser desfeita. Tem certeza que deseja apagar esse
            formulário?
          </span>
        ) : (
          <span>
            Ao confirmar, será gerada uma cópia do formulário atual e adicionada
            ao indicador. Futuras mudanças no formulário usado como base não
            serão refletidas no que está dentro do indicador e vice-versa.
          </span>
        )}
      </Modal>
      {isDeleteEvaluation && (
        <Modal
        open={!!isDeleteEvaluation}
        onOk={() => deleteEvaluation(isDeleteEvaluation)}
        onCancel={() => setIsDeleteEvaluation(null)}
        okText="Apagar"
        cancelText="Cancelar"
        title="Apagar aplicação"
        width={700}
        bodyStyle={{ padding: "0 1.2rem 1rem 1.2rem" }}
      >
        <span>
            Essa ação não pode ser desfeita. Tem certeza que deseja apagar essa
            aplicação?
          </span>
      </Modal>
      )}
      {evaluationModal && (
        <EvaluationModal
        evaluationData={evaluationModal}
        formId={formId}
        indicatorId={id}
        formName={formName}
        handleReload={handleReload}
        setEvaluationModal={setEvaluationModal}
      />
      )}
      
    </div>
  );
}
