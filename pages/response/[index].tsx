import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import styles from "../../styles/Response.module.css";
import { Header } from "../../src/components/header";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Button } from "antd";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useCRUD from "../../src/components/hooks/useCRUD";
import { toast } from "react-toastify";
import { QuestionResponse } from "../../src/components/questionResponse";

import { appRoutes } from "../../constants";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;

  return {
    props: {
      params,
    },
  };
};

const Response: NextPage = () => {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState({} as any);

  const { user } = useSelector((state: any) => state);
  const { handleGet: handleGetEvaluation } = useCRUD({
    model: "evaluation/one",
  });
  const { handleCreate: handleCreateResponse } = useCRUD({
    model: "response",
  });

  useEffect(() => {
    if (!router.isReady || !router.query.index) return;

    handleGetEvaluation({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${router.query.index}?withForm=true`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao carregar formulário", {
          toastId: "error-load-form",
        });
      } else {
        setEvaluation(data);
      }
    });
  }, [router.isReady, router.query.index]);

  const submit = () => {
    handleCreateResponse({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      values: {
        evaluationId: router.query.index,
        answers: evaluation.form.questions,
        classId: evaluation.class.id,
      },
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao enviar respostas", {
          toastId: "error-send-response",
        });
      } else {
        toast.success("Respostas enviadas com sucesso", {
          toastId: "success-send-response",
        });
        router.push(appRoutes.home);
      }
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Responder formulário - SAMI</title>
        <meta
          name="Página para responder formulário"
          content="Página para responder formulário"
        />
      </Head>
      <Header />
      <div className={styles.body}>

      <div className={styles.headerForm}>
        {evaluation.form?.name && (
          <h1 className={styles.title}>{evaluation.form.name}</h1>
        )}
        {evaluation.form?.description && (
          <p className={styles.description}>{evaluation.form.description}</p>
        )}
      </div>
      </div>
      <QuestionResponse evaluation={evaluation} setEvaluation={setEvaluation} />

      <div className={styles.footerForm}>
        <Button onClick={submit} type="primary" className={styles.footerButton}>
          Enviar respostas
        </Button>
      </div>
    </div>
  );
};

export default Response;
