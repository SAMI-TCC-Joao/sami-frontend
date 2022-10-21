import type { NextPage } from "next";
import { UploadOutlined } from "@ant-design/icons";
import { Header } from "../src/components/header";
import { Button, message } from "antd";
import type { UploadProps } from "antd";
import { InputForms } from "../src/components/inputForms";
import styles from "../styles/RegisterTeacher.module.css";
import Upload from "antd/lib/upload/Upload";

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
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.titleForms}>Cadastro Turma</div>
      <div className={styles.pageContainer}>
        <div className={styles.formsContainer}>
          <InputForms title="Nome" type="string" />
          <InputForms title="Nome da disciplina" type="string" />
          <InputForms title="Código da disciplina" type="string" />
          <InputForms title="Semestre" type="string" />

          <Upload {...props}>
            <Button className={styles.buttonUpload} icon={<UploadOutlined />}>
              Alunos
            </Button>
          </Upload>
        </div>

        <div className={styles.buttonDiv}>
          <Button className={styles.buttonCancel}>Voltar</Button>
          <Button className={styles.buttonRegister}>Cadastrar</Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterClass;
