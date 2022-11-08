import type { NextPage } from "next";
import { UploadOutlined } from "@ant-design/icons";
import { Header } from "../src/components/header";
import { Button, message } from "antd";
import type { UploadProps } from "antd";
import { InputForms } from "../src/components/inputForms";
import styles from "../styles/RegisterTeacher.module.css";
import Upload from "antd/lib/upload/Upload";
import useCRUD from "../src/components/hooks/useCRUD";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const props: UploadProps = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

const RegisterClass: NextPage = () => {
  const router = useRouter();

  const [classData, setClassData] = useState({});

  const { data, handleCreate, handleUpdate, loading } = useCRUD({ model: 'subjectClass', immediatlyLoadData: true });

  useEffect(() => {
    if(!loading) {
      setClassData(data);
    }
  },[data])

  const registerNewClass = () => {
    handleCreate({values: classData})
  }

  return loading ? (
    <div className={styles.container}>
      <Header />
      <div className={styles.titleForms}>Cadastro Turma</div>
      <div className={styles.pageContainer}>
        <div className={styles.formsContainer}>
          <InputForms title="Nome" type="string" onChange={e => {setClassData(prev => ({...prev, name: e.target.value}))}}/>
          <InputForms title="Nome da disciplina" type="string" onChange={e => {setClassData(prev => ({...prev, subjectName: e.target.value}))}}/>
          <InputForms title="Código da disciplina" type="number" onChange={e => {setClassData(prev => ({...prev, subjectid: e.target.value}))}}/>
          <InputForms title="Semestre" type="string" onChange={e => {setClassData(prev => ({...prev, semester: e.target.value}))}}/>

          <Upload {...props}>
            <Button className={styles.buttonUpload} icon={<UploadOutlined />}>
              Alunos
            </Button>
          </Upload>
        </div>

        <div className={styles.buttonDiv}>
          <Button className={styles.buttonCancel} onClick={() => router.back()}>Voltar</Button>
          <Button className={styles.buttonRegister} onClick={registerNewClass}>Cadastrar</Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default RegisterClass;
