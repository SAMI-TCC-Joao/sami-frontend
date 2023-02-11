import type { NextPage } from "next";
import readXlsxFile from "read-excel-file";
import useDownloader from "react-use-downloader";
import { Header } from "../src/components/header";
import { Button } from "antd";
import { InputForms } from "../src/components/inputForms";
import styles from "../styles/RegisterTeacher.module.css";
import useCRUD from "../src/components/hooks/useCRUD";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import React from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { ITableUser } from "../src/types/interfaces";
import { appRoutes } from "../constants";
import StudentsTable from "../src/components/tables/studentsTable";

const formFields = [
  { title: "Nome", type: "string", key: "name" },
  { title: "Nome da disciplina", type: "string", key: "subjectName" },
  { title: "Código da disciplina", type: "string", key: "subjectId" },
  { title: "Semestre", type: "string", key: "semester" },
];

const RegisterClass: NextPage = () => {
  const { user } = useSelector((state: any) => state);
  const [tableData, setTableData] = useState<ITableUser[]>({} as ITableUser[]);
  const router = useRouter();
  const [classData, setClassData] = useState({});
  const [userDataId, setUserDataId] = useState("");
  const [openModal, setOpenModal] = useState(false);

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

              toast.success(`Turma criada com sucesso!`);
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
                key={`${index}`}
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
          <p className={styles.labelForm}>Alunos</p>
          <StudentsTable
            students={
              (tableData.length > 0 &&
                tableData?.map((info) => {
                  return {
                    id: "none",
                    user: info,
                  };
                })) ||
              []
            }
            setOpenModal={setOpenModal}
            setUserDataId={setUserDataId}
            notEditable
          />
          <div className={styles.xlsxDiv}>
            <Button
              className={styles.xlsxButton}
              onClick={() => download("/exemplo.xlsx", "exemplo.xlsx")}
            >
              Baixar exemplo
            </Button>
            <label className={styles.xlsxLabel} htmlFor="file">
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