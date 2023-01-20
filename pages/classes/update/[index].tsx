/* eslint-disable react-hooks/rules-of-hooks */
import styles from "@/styles/UpdateClass.module.css";
import { Button, Form, Input } from "antd";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import BackPage from "../../../src/components/backPages";
import { Header } from "../../../src/components/header";
import Upload from "antd/lib/upload/Upload";
import { UploadOutlined } from "@ant-design/icons";
import readXlsxFile from "read-excel-file";
import useCRUD from "../../../src/components/hooks/useCRUD";
import { toast } from "react-toastify";
import StudentsTable from "../../../src/components/tables/studentsTable";
import RemoveStudentModal from "../../../src/components/modals/removeStudent";
import { ITableUser } from "../../../src/types/interfaces";
import { info } from "console";

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
    if (!route.isReady) return;

    handleGetClass({
      refetchPathOptions: route.query.index as string,
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data, error }: any) => {
      if (error) {
        console.log(error);
        toast.error("Error ao puxar os dados da turma", {
          toastId: "getClass",
        });
        return;
      }

      console.log(data);
      setClassData({
        id: data.id,
        name: data.name,
        semester: data.semester,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        UsersSubjectClasses: data.UsersSubjectClasses.map((infos) => {
          return {
            id: infos?.id,
            user: infos?.user,
          };
        }),
      });
      return;
    });
  }, []);

  useEffect(() => {
    if (classData.id) {
      setLoading(false);
    }
  }, [classData]);

  const onUploadFile = (info) => {
    console.log(info);

    if (info.file.status === "done") {
      if (info.file.name.split(".")[1] !== "xlsx") {
        toast.error("Arquivo inválido", {
          toastId: "upload",
        });
        return;
      }

      toast.success(`Arquivo '${info.file.name}' carregado com sucesso`, {
        toastId: "uploadSuccess",
      });

      readXlsxFile(info.file.originFileObj).then((rows) => {
        const dataShift = rows.shift() as string[]; // remover a primeira linha com os nomes das colunas
        // mapear os dados para um objeto:
        const data = rows.map((row) => {
          const obj = {}; // criar um objeto vazio
          row.forEach((item, index) => {
            obj[dataShift[index]] = item; // adicionar os dados no objeto
          });
          return obj;
        });
        console.log(data); // aqui so pra mostrar no console, pode tirar depois
        if (data !== undefined) {
          setTableData(
            data.map((info) => {
              return {
                email: info.email,
                name: info.name,
                registration: String(info.registration),
              };
            })
          );
          createNewUsersRelation();
        }
      });
    }
    if (info.file.status === "error") {
      // se der erro, mostrar uma mensagem de erro:
      toast.error("Erro ao carregar arquivo", {
        toastId: "uploadError",
      });
    }
  };

  const createNewUsersRelation = () => {
    for (let i = 0; i < tableData.length; i++) {
      console.log(tableData[i]);

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
              console.log(error);
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

      console.log(data);
      toast.success("Turma atualizada com sucesso", {
        toastId: "updateClass",
      });
      handleGetClass();
    });
  };

  return hasEnums && !loading ? (
    <div className={styles.container}>
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
                  students={classData.UsersSubjectClasses}
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
                  <Upload
                    onChange={onUploadFile}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onRemove={() => {
                      setTableData([]);
                    }}
                    maxCount={1}
                  >
                    <Button
                      className={styles.addStudentsBtn}
                      icon={<UploadOutlined />}
                      type="primary"
                    >
                      Adicionar Alunos
                    </Button>
                  </Upload>
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
