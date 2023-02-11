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
  const { handleGet: handleGetForm } = useCRUD({
    model: "form/one",
  });
  const { handleCreate: handleCreateResponse } = useCRUD({
    model: "response",
  });

  useEffect(() => {
    if (!router.isReady || !router.query.index) return;

    if (router.query.teacher) {
      handleGetForm({
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
          setEvaluation({ form: data });
        }
      });
    } else {
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
          if (data.form.random) {
            data.form.questions = data.form.questions.sort(() =>
              Math.random() > 0.5 ? 1 : -1
            );
          }

          setEvaluation(data);
        }
      });
    }
  }, [router.isReady, router.query.index]);

  const submit = () => {
    const verifyMandatory = evaluation.form.questions.map((question: any) => {
      if (!question.mandatory) {
        return;
      }

      if (question.type === "text" && question.options.textResponse !== "") {
        return;
      }

      if (question.type === "alternative") {
        const selectedAlternative = question.options.alternatives.find(
          (alternative: any) => alternative.correct
        );

        if (selectedAlternative) {
          return;
        }
      }

      if (question.type === "likert") {
        const selectedLikert = question.options.lines.find(
          (likert: any) => likert.value === ""
        );

        if (!selectedLikert) {
          return;
        }
      }

      if (question.type === "multipleChoice") {
        const selectedMultipleChoice = question.options.alternatives.find(
          (alternative: any) => alternative.correct
        );

        if (selectedMultipleChoice) {
          return;
        }
      }

      return "error";
    });

    if (verifyMandatory.includes("error")) {
      toast.error("Preencha todas as questões obrigatórias", {
        toastId: "error-mandatory-questions",
      });
      return;
    }

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
        toast.success("Respostas enviadas com sucesso");
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
      <QuestionResponse
        evaluation={evaluation}
        setEvaluation={setEvaluation}
        isTeacher={!!router.query.teacher}
      />
      <div className={styles.footerForm}>
      <Button
          onClick={() => router.back()}
          type="primary"
          className={styles.footerButton}
        >
          voltar
        </Button>
        {!router.query.teacher && (
          <Button
          onClick={submit}
          type="primary"
          className={styles.footerButton}
        >
          Responder
        </Button>
        )}
      </div>
    </div>
  );
};

export default Response;
