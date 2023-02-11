import type { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { Header } from "../../src/components/header";
import { Dropdown, Modal, Table, Tooltip } from "antd";
import { InputForms } from "../../src/components/inputForms";
import useCRUD from "../../src/components/hooks/useCRUD";
import styles from "../../styles/RegisterTeacher.module.css";
import { toast } from "react-toastify";
import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Head from "next/head";

const AllTeacher: NextPage = () => {
  const { user } = useSelector((state: any) => state);

  const [dataTable, setDataTable] = useState([] as any);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    registration: "",
  });
  const [editId, setEditId] = useState("");

  const router = useRouter();

  const { handleGet } = useCRUD({
    model: "user/teacher",
  });

  const { handleUpdate } = useCRUD({
    model: "user/id",
  });

  const { handleDelete: handleDeleteUser } = useCRUD({
    model: "user",
  });

  const handleGetAll = () => {
    handleGet({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }) => {
      if (error) {
        toast.error(error, {
          toastId: "errorGetAllTeacher",
        });
      }
      setData(data);
    });
  };

  const handleMenu = (key: string, type: string, id?: string) => {
    if (key === "edit") {
      setEditId(id || "");
      setIsModalOpen(true);
    } else if (key === "delete") {
      setEditId(id || "");
      setDeleteModal(true);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    handleGetAll();
  }, []);

  useEffect(() => {
    if (!editId) return;

    const teacher = data.find((item: any) => item.id === editId);
    setTeacherData({
      name: teacher?.name || "",
      email: teacher?.email || "",
      registration: teacher?.registration || "",
    });
  }, [editId]);

  useEffect(() => {
    handleDataSource();
  }, [data]);

  const handleDelete = () => {
    handleDeleteUser({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${editId}`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error(error, {
          toastId: "errorDeleteTeacher",
        });
      }
      toast.success("Professor(a) deletado com sucesso!", {
        toastId: "successDeleteTeacher",
      });
      handleGetAll();
      setIsModalOpen(false);
    });
  };

  const handleOk = () => {
    handleUpdate({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${editId}`,
      values: teacherData,
    }).then(({ data, error }) => {
      if (error) {
        toast.error(error, {
          toastId: "errorUpdateTeacher",
        });
      }
      toast.success("Professor(a) atualizado com sucesso!", {
        toastId: "successUpdateTeacher",
      });
      setTimeout(() => {
        handleGetAll();
        handleDataSource();
      }, 2000);
      setIsModalOpen(false);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setDeleteModal(false);
  };

  const handleDataSource = () => {
    console.log(data, "data");
    const dataSource = data.map((item: any, index: number) => {
      return {
        key: index,
        name: <div className={styles.nameContainer}>{item.name}</div>,
        email: <div className={styles.nameContainer}>{item.email}</div>,
        registration: (
          <div className={styles.nameContainer}>{item.registration}</div>
        ),
        createdAt: (
          <div className={styles.nameContainer}>
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        ),
        actions: (
          <Dropdown
            arrow
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Editar",
                },
                {
                  key: "delete",
                  label: "Deletar",
                  danger: true,
                },
              ],
              onClick: (e) => handleMenu(e.key, "form", item.id),
            }}
          >
            <img src="/more.svg" alt="ver mais" className={styles.moreIcon} />
          </Dropdown>
        ),
      };
    });

    setDataTable(dataSource);
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "15%",
    },
    {
      title: "matricula",
      dataIndex: "registration",
      key: "registration",
      width: "15%",
    },
    {
      title: "Criado em",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "5%",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
    },
  ];

  const handleChangeValues = (e: ChangeEvent<HTMLInputElement>) => {
    setTeacherData((values: any) => ({
      ...values,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Professores - SAMI</title>
        <meta
          name="Todos os professores da plataforma"
          content="Página de todos os professores da plataforma"
        />
      </Head>
      <Header />
      <div className={styles.titleFormsAll}>Professores</div>
      <div className={styles.pageContainer}>
        <Table
          dataSource={[...dataTable]}
          columns={columns}
          pagination={false}
        />
      </div>
      <Modal
        open={isModalOpen}
        onOk={deleteModal ? handleDelete : handleOk}
        onCancel={handleCancel}
        okText={deleteModal ? "Deletar" : "Salvar"}
        cancelText={"Cancelar"}
        title={deleteModal ? `Deletar professor(a)?` : "editar professor(a)?"}
        width={700}
        bodyStyle={{ padding: "0 1.2rem 1rem 1.2rem" }}
      >
        <div>
          {deleteModal ? (
            <div className={styles.deleteModal}>
              Tem certeza que deseja deletar esse professor(a)?
            </div>
          ) : (
            <>
              <InputForms
                title="Nome"
                type="string"
                name="name"
                onChange={handleChangeValues}
                value={teacherData.name}
              />
              <InputForms
                title="Email"
                type="email"
                name="email"
                onChange={handleChangeValues}
                value={teacherData.email}
              />
              <InputForms
                title="Matricula"
                type="string"
                name="registration"
                onChange={handleChangeValues}
                value={teacherData.registration}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AllTeacher;