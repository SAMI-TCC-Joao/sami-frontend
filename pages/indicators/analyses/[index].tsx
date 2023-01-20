import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import styles from "../../../styles/indicators/analyses.module.css";
import { Header } from "../../../src/components/header";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Collapse, InputRef } from "antd";
import { toast } from "react-toastify";
import useCRUD from "../../../src/components/hooks/useCRUD";
import { TitlePage } from "../../../src/components/titlePage";
import { Legend, ResponsiveContainer, Tooltip, Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

const AnalysesIndicator: NextPage = () => {
  const { Panel } = Collapse;
  const { handleGet: handleGetOne } = useCRUD({ model: "indicator/one" });

  const { user } = useSelector((state: any) => state);
  const router = useRouter();

  const inputRef = useRef<InputRef>(null);

  const [indicator, setIndicator] = useState({
    id: "",
    name: "",
    description: "",
    forms: [],
    methodologyId: "",
    groupId: "",
    userId: "",
  });

  useEffect(() => {
    if (!router.isReady || !router.query.index) return;
    handleGetOne({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${router.query.index}?analyses=true`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao buscar indicador");
        return;
      }

      setIndicator(data);
    });
  }, [router.query.index]);

  const renderChart = (QuestionResponse: any, question: any) => {
    const type = question?.type;
    switch (type) {
      case "text":
        return QuestionResponse.map((data: any) => {
          return (
            <div key={data.id}>
              <div>
                {data.user.name} - {data.class.name}
              </div>
              <div>{data.answer.textResponse}</div>
            </div>
          );
        });
      case "alternative": // arrumar os graficos e filtro, arrumar pra procurar se o user ta na sala, validar envio do form se tem todos obrigatorios
        const dataToChart = QuestionResponse.map((data: any) => {

          const correctAlternative = data.answer.alternatives.find(
            (alternative: any) => alternative.correct
          );

          const count = QuestionResponse.reduce((acc: any, curr: any) => {
            const correctAlternative = curr.answer.alternatives.find(
              (alternative: any) => alternative.correct
            );

            if (acc[correctAlternative.value]) {
              acc[correctAlternative.value] += 1;
            } else {
              acc[correctAlternative.value] = 1;
            }

            return acc;
          }, {});

          return {
            name: correctAlternative.value,
            value: count[correctAlternative.value],
          };
        });

        return (
          <div style={{ width: "20rem", height: "20rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  data={dataToChart}
                  cx="50%"
                  cy="50%"
                  outerRadius={20}
                  fill="#8884d8"
                  label={(entry) => entry.name}
                  legendType="circle"
                  labelLine={false}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "multipleChoice":
        const dataToChartMultipleChoice = QuestionResponse.reduce((acc: any, curr: any) => {
          const correctAlternative = curr.answer.alternatives.filter(
            (alternative: any) => alternative.correct
          );

          correctAlternative.forEach((alternative: any) => {
            if (acc[alternative.value]) {
              acc[alternative.value] += 1;
            } else {
              acc[alternative.value] = 1;
            }
          });

          return acc;
        }, {});

        const dataToChartMultipleChoiceArray = Object.keys(dataToChartMultipleChoice).map((key) => {
          return {
            name: key,
            value: dataToChartMultipleChoice[key],
          };
        });

        return (
          <div style={{ width: "20rem", height: "20rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  data={dataToChartMultipleChoiceArray}
                  cx="50%"
                  cy="50%"
                  outerRadius={20}
                  fill="#8884d8"
                  label={(entry) => entry.name}
                  legendType="circle"
                  labelLine={false}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Analise indicador - SAMI</title>
        <meta name="Indicadores" content="Página de indicadores da aplicação" />
      </Head>
      <Header />
      <TitlePage
        title="Indicadores"
        isIndicator
        nameIndicator={indicator.name}
        hideButton
      />
      <div className={styles.body}>
        <div> {/* onde vai ficar o filtro */}</div>
        <Collapse ghost>
          {indicator.forms.map((form: any) => {
            return (
              <Panel key={form.id} header={form.name}>
                <div>
                  {form.questions.map((question: any, index: number) => {
                    return (
                      <div key={question.id}>
                        <div>
                          <p>
                            {index + 1}. {question.title}
                          </p>
                          <p className={styles.viewQuestion}>Ver pergunta</p>
                        </div>
                        <div className={styles.questionContainer}>
                          {question.QuestionResponse && question.type !== 'likert' ? (
                            renderChart(
                              question.QuestionResponse,
                              question
                            )
                          ) : (
                            <p>Nenhuma resposta</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    </div>
  );
};

export default AnalysesIndicator;
