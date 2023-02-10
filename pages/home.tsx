import type { NextPage } from "next";
import { Tabs } from "antd";
import styles from "../styles/Home.module.css";
import { FormCard } from "../src/components/formCard";
import { Header } from "../src/components/header";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { appRoutes } from "../constants";
import { TitlePage } from "../src/components/titlePage";
import useCRUD from "../src/components/hooks/useCRUD";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const Home: NextPage = () => {
  const { forms, user } = useSelector((state: any) => state);
  const [evaluations, setEvaluations] = useState([] as any);
  const [templateForms, setTemplateForms] = useState<any>([]);

  const { handleGet: getTemplateForms } = useCRUD({
    model: "form",
    pathOptions: "template",
  });

  useEffect(() => {
    if (user?.userType === "student") {
      return;
    }
    getTemplateForms().then(({ data }) => {
      setTemplateForms(data);
    });
  }, []);

  const items = [
    {
      key: "my",
      label: `Meus formulários`,
      children: forms.forms?.length
        ? forms.forms?.map((form: any) => (
            <FormCard
              key={form.id}
              id={form.id}
              title={form.name}
              date={`${new Date(form.createdAt).toLocaleDateString()}`}
              isTeacher
            />
          ))
        : "Nenhum cadastrado",
    },
    {
      key: "template",
      label: `Templates do sistema`,
      children: templateForms?.length
        ? templateForms?.map((form: any) => (
            <FormCard
              key={form.id}
              id={form.id}
              title={form.name}
              date={`${new Date(form.createdAt).toLocaleDateString()}`}
              isTemplate
              isTeacher
            />
          ))
        : "Nenhum cadastrado",
    },
  ];

  const { handleGet: handleGetEvaluation } = useCRUD({
    model: "evaluation/student",
  });

  useEffect(() => {
    if (user?.userType === "student") {
      handleGetEvaluation({
        header: {
          Authorization: `Bearer ${user.token}`,
        },
      }).then(({ data, error }) => {
        if (error) {
          return toast.error("Erro ao carregar avaliações", {
            toastId: "error",
          });
        }
        const evaluationData = data.filter((evaluation: any) => {
          if (
            dayjs().isBetween(evaluation.initialDate, evaluation.finalDate) &&
            evaluation.repeat[dayjs().format("dddd").toLowerCase()]
          ) {
            return evaluation;
          }
        });
        setEvaluations(evaluationData);
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Home - SAMI</title>
        <meta name="Página inicial" content="Página inicial da aplicação" />
      </Head>
      <Header />
      <div className={styles.body}>
        <TitlePage
          title={
            user?.userType === "student"
              ? `Formulários a responder
          `
              : `Formulários`
          }
          url={appRoutes.registerForm}
          isStudent={user?.userType === "student"}
        />
        <div className={styles.cardsDiv}>
          {user?.userType === "student" ? (
            evaluations.length > 0 ? (
              evaluations?.map((evaluation: any) => (
                <FormCard
                  key={evaluation?.id}
                  id={evaluation?.id}
                  title={evaluation?.form.name}
                  dateRange={[
                    new Date(evaluation?.initialDate).toLocaleDateString(),
                    new Date(evaluation?.finalDate).toLocaleDateString(),
                  ]}
                  isEvaluation
                />
              ))
            ) : (
              "Nenhum formulário disponível"
            )
          ) : (
            <Tabs className={styles.tabs} defaultActiveKey="my" items={items} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;