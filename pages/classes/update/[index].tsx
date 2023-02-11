/* eslint-disable react-hooks/rules-of-hooks */
import styles from "../../../styles/UpdateClass.module.css";
import { Button, Form, Input } from "antd";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import BackPage from "../../../src/components/backPages";
import { Header } from "../../../src/components/header";
import readXlsxFile from "read-excel-file";
import useCRUD from "../../../src/components/hooks/useCRUD";
import { toast } from "react-toastify";
import StudentsTable from "../../../src/components/tables/studentsTable";
import RemoveStudentModal from "../../../src/components/modals/removeStudent";
import { ITableUser } from "../../../src/types/interfaces";
import { appRoutes } from "../../../constants";
import Head from "next/dist/shared/lib/head";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = (context) => {
  const { params } = context;

  return {
    props: {
      params,
    },
  };
};

interface AllDataClass {
  id: string | null;
  name: string;
  semester: string;
  subjectName: string;
  subjectId: number;
  UsersSubjectClasses: any[];
}

const UpdateClass: NextPage = () => {
  const { enums, user } = useSelector((state: any) => state);
  const hasEnums = Object.keys(enums).length;
  const route = useRouter();
  const router = useRouter();

  const [classData, setClassData] = useState<AllDataClass>({
    id: null,
    name: "",
    semester: "",
    subjectId: 0,
    subjectName: "",
    UsersSubjectClasses: [{}],
  });
  const [loading, setLoading] = useState(true);
  const [userDataId, setUserDataId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [tableData, setTableData] = useState<ITableUser[]>([] as ITableUser[]);

  const { handleGet: handleGetClass } = useCRUD({
    model: "classe/one",
  });

  const { handleUpdate: handleUpdateClass } = useCRUD({
    model: "classe",
  });

  const { handleCreate: handleCreateUser } = useCRUD({
    model: "user",
  });

  const { handleGet: handleGetUser } = useCRUD({
    model: "user",
  });

  const { handleCreate: handleCreateRelationClass } = useCRUD({
    model: "classes-relation",
  });

  useEffect(() => {
    if (!route.isReady || !route.query.index) return;

    handleGetClass({
      refetchPathOptions: route.query.index as string,
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }: any) => {
      if (error) {
        toast.error("Error ao puxar os dados da turma", {
          toastId: "getClass",
        });
        return;
      }

      setClassData({
        id: data.id,
        name: data.name,
        semester: data.semester,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        UsersSubjectClasses: data.UsersSubjectClasses.map((infos: any) => {
          return {
            id: infos?.id,
            user: infos?.user,
          };
        }),
      });
      return;
    });
  }, [route.query.index]);

  useEffect(() => {
    if (classData.id) {
      setLoading(false);
    }
  }, [classData]);

  const onUploadFile = async (info: any) => {
    setTableData([]);
    const data = await info.arrayBuffer();
    readXlsxFile(data).then((rows) => {
      const dataShift = rows.shift() as string[];

      const data = rows.map((row) => {
        const obj = {};
        row.forEach((item, index) => {
          obj[dataShift[index]] = item;
        });
        return obj;
      });

      if (data !== undefined) {
        setTableData(
          data.map((info: any) => {
            return {
              email: info.email,
              name: info.name || info.nome,
              registration: String(info.registration || info.matricula),
            };
          })
        );
      }
    });
  };

  const createNewUsersRelation = () => {
    for (let i = 0; i < tableData.length; i++) {
      handleCreateUser({
        values: { ...tableData[i], userType: "student" },
        header: {
          Authorization: `Bearer ${user.token}`,
        },
      }).then(({ data, error }: any) => {
        const handleRelationClass = async (userId: string) => {
          await handleCreateRelationClass({
            values: { subjectClassId: route.query.index as string, userId },
          });
        };

        if (error?.message === "Usuário já cadastrado") {
          handleGetUser({
            refetchPathOptions: `${tableData[i].email}`,
            header: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then(({ data, error }: any) => {
            if (error) {
              toast.error("Error ao localizar o usuário", {
                toastId: "getUser",
              });
              return;
            }

            handleRelationClass(data.id);
            return;
          });
        }

        if (error) {
          console.error(error);
          return;
        }

        handleRelationClass(data.id);
        return;
      });
    }
    toast.success("Turma atualizada com sucesso", {
      toastId: "updateClass",
    });
  };

  const updateClass = () => {
    handleUpdateClass({
      refetchPathOptions: route.query.index as string,
      values: { ...classData },
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }: any) => {
      if (error) {
        console.error(error);
        toast.error("Não foi possível atualizar a turma", {
          toastId: "updateClass",
        });
      }

      toast.success("Turma atualizada com sucesso", {
        toastId: "updateClass",
      });

      createNewUsersRelation();
      handleGetClass().then(() => {
        router.push(appRoutes.classes);
      });
    });
  };

  return hasEnums && !loading ? (
    <div
      style={{
        overflowX: "hidden",
        height: "100vh",
      }}
    >
      <Head>
        <title>Atualizar turma - SAMI</title>
        <meta
          name="Atualizar turma"
          content="Página para atualizar uma turma"
        />
      </Head>
      <Header />

      <div className={styles.body}>
        <BackPage />

        <div className={styles.content}>
          <h1 className={styles.title}>Atualizar Turma</h1>

          <div className={styles.containerForm}>
            <div className={styles.contentForm}>
              <form
                style={{
                  alignContent: "center",
                  textAlign: "center",
                }}
                autoComplete="off"
              >
                <label className={styles.labelForm} htmlFor="name">
                  Nome
                </label>
                <Form.Item
                  name="name"
                  id="name"
                  style={{ fontSize: "0" }}
                  rules={[
                    {
                      required: true,
                      message: "Adicione um nome!",
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    style={{ fontSize: "1.1rem", textAlign: "center" }}
                    defaultValue={classData.name}
                    onChange={(e) => {
                      setClassData({
                        ...classData,
                        name: e.target.value,
                      });
                    }}
                  />
                </Form.Item>

                <label className={styles.labelForm} htmlFor="discipline">
                  Disciplina
                </label>
                <Form.Item
                  name="discipline"
                  id="discipline"
                  rules={[
                    {
                      required: true,
                      message: "Coloque uma disciplina!",
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    style={{ fontSize: "1.1rem", textAlign: "center" }}
                    defaultValue={classData.subjectName}
                    onChange={(e) => {
                      setClassData({
                        ...classData,
                        subjectName: e.target.value,
                      });
                    }}
                  />
                </Form.Item>

                <label className={styles.labelForm} htmlFor="code">
                  Código de disciplina
                </label>
                <Form.Item
                  name="code"
                  id="code"
                  rules={[
                    {
                      required: true,
                      message: "Coloque uma disciplina!",
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    style={{ fontSize: "1.1rem", textAlign: "center" }}
                    defaultValue={classData.subjectId}
                    onChange={(e) => {
                      setClassData({
                        ...classData,
                        subjectId: Number(e.target.value),
                      });
                    }}
                  />
                </Form.Item>

                <p className={styles.labelForm}>Alunos</p>
                <StudentsTable
                  students={[
                    ...classData.UsersSubjectClasses,

                    ...tableData?.map((info) => {
                      return {
                        id: "none",
                        user: info,
                      };
                    }),
                  ]}
                  setOpenModal={setOpenModal}
                  setUserDataId={setUserDataId}
                />

                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <label
                    style={{
                      padding: "20px 10px",
                      width: "200p",
                      backgroundColor: "#333",
                      color: "#FFF",
                      textTransform: "uppercase",
                      textAlign: "center",
                      display: "block",
                      marginTop: "10px",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                    htmlFor="file"
                  >
                    Adicionar alunos
                  </label>
                  <input
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                    name="file"
                    accept=".xlsx"
                    onChange={(e: any) => {
                      onUploadFile(e.target.files[0]);
                    }}
                  />
                  <span>(Apenas arquivos xlsx)</span>
                </div>

                <div className={styles.contentBtns}>
                  <Button
                    type="primary"
                    className={styles.backBtn}
                    onClick={() => route.back()}
                  >
                    Voltar
                  </Button>

                  <Button
                    type="primary"
                    className={styles.updateBtn}
                    onClick={updateClass}
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {openModal ? (
          <RemoveStudentModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            userDataId={userDataId}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  ) : null;
};

export default UpdateClass;