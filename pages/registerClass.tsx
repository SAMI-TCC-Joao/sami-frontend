import type { NextPage } from "next";
import { UploadOutlined } from "@ant-design/icons";
import readXlsxFile from "read-excel-file";
import useDownloader from "react-use-downloader";
import { Header } from "../src/components/header";
import { Button } from "antd";
import { InputForms } from "../src/components/inputForms";
import styles from "../styles/RegisterTeacher.module.css";
import Upload from "antd/lib/upload/Upload";
import useCRUD from "../src/components/hooks/useCRUD";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import React from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { ITableUser } from "../src/types/interfaces";
import { appRoutes } from "../constants";

const formFields = [
  { title: "Nome", type: "string", key: "name" },
  { title: "Nome da disciplina", type: "string", key: "subjectName" },
  { title: "Código da disciplina", type: "number", key: "subjectId" },
  { title: "Semestre", type: "string", key: "semester" },
];

const RegisterClass: NextPage = () => {
  const { user } = useSelector((state: any) => state);
  const [tableData, setTableData] = useState<ITableUser[]>({} as ITableUser[]);
  const router = useRouter();
  const [classData, setClassData] = useState({});

  const { download } = useDownloader();

  const {
    data,
    handleCreate: handleCreateClass,
    loading,
  } = useCRUD({
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
    if (!loading && data) {
      setClassData(data);
    }
  }, [data]);

  const onUploadFile = (info: any) => {
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
                name: info.name,
                registration: String(info.registration),
              };
            })
          );
        }
      });
    } else if (info.file.status === "error") {
      toast.error("Erro ao carregar arquivo", {
        toastId: "uploadError",
      });
    }
  };

  const registerNewClass = () => {
    handleCreateClass({
      values: { ...classData },
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data: dataClass }) => {
      if (!dataClass) {
        toast.error("Erro ao criar turma", {
          toastId: "createClass",
        });
      }

      for (let i = 0; i < tableData.length; i++) {
        handleCreateUser({
          values: { ...tableData[i], userType: "student" },
          header: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then(({ data, error }: any) => {
          const handleRelationClass = async (userId: string) => {
            await handleCreateRelationClass({
              values: { subjectClassId: dataClass.id, userId },
            }).then(({ error }: any) => {
              if (error) {
                console.error(error);
                return;
              }

              router.push(appRoutes.classes);
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
            console.log(error);
            return;
          }

          handleRelationClass(data.id);
          return;
        });
      }
    });
  };

  return !loading ? (
    <div className={styles.container}>
      <Head>
        <title>Registrar nova turma - SAMI</title>
        <meta
          name="Registrar uma nova turma"
          content="Página para registrar uma nova turma"
        />
      </Head>
      <Header />
      <div className={styles.titleForms}>Cadastro Turma</div>
      <div className={styles.pageContainer}>
        <div className={styles.formsContainer}>
          {formFields.map((field, index) => {
            const { key, type } = field;
            return (
              <InputForms
                key={index}
                onChange={(e) => {
                  setClassData((prev) => ({
                    ...prev,
                    [key]:
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  }));
                }}
                {...field}
              />
            );
          })}
          <div className={styles.xlsxDiv}>
            <span>(Apenas arquivos xlsx)</span>
            <Button
              className={styles.xlsxButton}
              onClick={() => download("/exemplo.xlsx", "exemplo.xlsx")}
            >
              Baixar exemplo
            </Button>
            <Upload
              onChange={onUploadFile}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onRemove={() => {
                setTableData([]);
              }}
              maxCount={1}
            >
              <Button className={styles.buttonUpload} icon={<UploadOutlined />}>
                Alunos
              </Button>
            </Upload>
          </div>
        </div>

        <div className={styles.buttonDiv}>
          <Button className={styles.buttonCancel} onClick={() => router.back()}>
            Voltar
          </Button>
          <Button className={styles.buttonRegister} onClick={registerNewClass}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default RegisterClass;