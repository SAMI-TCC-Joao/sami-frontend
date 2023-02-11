import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import styles from "../../../styles/indicators/analyses.module.css";
import { Header } from "../../../src/components/header";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Checkbox, Collapse, Modal, Radio, Select, Tooltip } from "antd";
import { toast } from "react-toastify";
import useCRUD from "../../../src/components/hooks/useCRUD";
import { TitlePage } from "../../../src/components/titlePage";
import {
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

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
  const { handleCreate: handleGetOne } = useCRUD({ model: "indicator/one" });
  const { handleGet: handleGetFilter } = useCRUD({ model: "classe/indicator" });

  const { user } = useSelector((state: any) => state);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({} as any);
  const [filterClass, setFilterClass] = useState([] as string[]);
  const [filterUser, setFilterUser] = useState([] as any);
  const [filter, setFilter] = useState({} as any);

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
      refetchPathOptions: `${router.query.index}`,
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao buscar indicador");
        return;
      }

      setIndicator(data);

      handleGetFilter({
        header: {
          Authorization: `Bearer ${user.token}`,
        },
        refetchPathOptions: `${router.query.index}`,
      }).then(({ data, error }) => {
        if (error) {
          toast.error("Erro ao buscar classes");
          return;
        }

        setFilter(data);
      });
    });
  }, [router.query.index]);

  const randomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const renderChart = (QuestionResponse: any, question: any) => {
    const type = question?.type;
    switch (type) {
      case "text":
        return QuestionResponse.map((data: any) => {
          return (
            <div key={data.id} className={styles.textQuestion}>
              <div>
                {data.user.name} - {data.class.name}:
              </div>
              <div>{data.answer.textResponse}</div>
            </div>
          );
        });
      case "alternative":
        const dataToChart = QuestionResponse.reduce((acc: any, curr: any) => {
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

        const dataToChartArray = Object.keys(dataToChart).map((key) => {
          return {
            name: key,
            value: dataToChart[key],
            color: randomColor(),
          };
        });

        return (
          <div style={{ width: "60rem", height: "20rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  data={dataToChartArray}
                  cx="50%"
                  cy="50%"
                  fill="#8884d8"
                  label={(entry) => entry.name + ": " + entry.value}
                  legendType="circle"
                  labelLine={false}
                >
                  {dataToChartArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="middle" align="left" layout="vertical" />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "multipleChoice":
        const dataToChartMultipleChoice = QuestionResponse.reduce(
          (acc: any, curr: any) => {
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
          },
          {}
        );

        const dataToChartMultipleChoiceArray = Object.keys(
          dataToChartMultipleChoice
        ).map((key) => {
          return {
            name: key,
            value: dataToChartMultipleChoice[key],
            color: randomColor(),
          };
        });

        return (
          <div style={{ width: "60rem", height: "20rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  data={dataToChartMultipleChoiceArray}
                  cx="50%"
                  cy="50%"
                  fill="#8884d8"
                  label={(entry) => entry.name + ": " + entry.value}
                  legendType="circle"
                  labelLine={false}
                  >
                  {dataToChartMultipleChoiceArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="middle" align="left" layout="vertical" />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "likert":
        const count = question.options.lines.map((line: any) => {
          const count = QuestionResponse.reduce((acc: any, curr: any) => {
            const lineResponse = curr.answer.lines.find(
              (lineResponse: any) => lineResponse.id === line.id
            );

            if (acc[lineResponse.response]) {
              acc[lineResponse.response] += 1;
            } else {
              acc[lineResponse.response] = 1;
            }

            return acc;
          }, {});

          return {
            name: line.value,
            ...count,
          };
        });

        return (
          <div style={{ width: "60rem", height: "20rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart width={400} height={400} data={count}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis stroke="#8884d8" />
                <RechartsTooltip />
                {question.options.columns.map((column: any) => {
                  return (
                    <Bar
                      dataKey={column.id}
                      key={column.id}
                      name={column.value}
                      cx="50%"
                      cy="50%"
                      fill={randomColor()}
                      label={(entry) => entry.name}
                      legendType="circle"
                    />
                  );
                })}
                <Legend verticalAlign="middle" align="left" layout="vertical" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  const handleCancel = () => {
    setModalContent({});
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!router.isReady || !router.query.index) return;
    handleGetOne({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
      refetchPathOptions: `${router.query.index}`,
      ...(filterUser.length > 0
        ? {
            values: {
              usersId: filterUser,
            },
          }
        : filterClass.length > 0
        ? {
            values: {
              classId: filterClass,
            },
          }
        : {}),
    }).then(({ data, error }) => {
      if (error) {
        toast.error("Erro ao buscar filtros");
        return;
      }
      setIndicator(data);
    });
  }, [filterClass, filterUser]);

  const renderModal = () => {
    switch (modalContent.type) {
      case "multipleChoice":
        return (
          <div>
            <div className={styles.modalTitle}>{modalContent.title}</div>
            <div className={styles.questionBody}>
              {modalContent.options.alternatives.map((alternative: any) => {
                return (
                  <Checkbox key={alternative.id} disabled>
                    <p className={styles.modalDescription}>
                      {alternative.value}
                    </p>
                  </Checkbox>
                );
              })}
            </div>
          </div>
        );
      case "alternative":
        return (
          <div>
            <div className={styles.modalTitle}>{modalContent.title}</div>
            <div className={styles.questionBody}>
              {modalContent.options.alternatives.map((alternative: any) => {
                return (
                  <Radio disabled key={alternative.id}>
                    {alternative.value}
                  </Radio>
                );
              })}
            </div>
          </div>
        );
      case "text":
        return (
          <div>
            <div className={styles.modalTitle}>{modalContent.title}</div>
          </div>
        );
      case "likert":
        return (
          <div className={styles.likertContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.thTable}>
                  <th></th>
                  {modalContent.options.columns?.map(
                    (column: any, indexQuestion: number) => {
                      return (
                        <th key={indexQuestion}>
                          <p className={styles.likertQuestion}>
                            {column.value}
                          </p>
                        </th>
                      );
                    }
                  )}
                </tr>
              </thead>
              <tbody>
                {modalContent.options.lines?.map(
                  (row: any, indexLine: number) => {
                    return (
                      <tr key={indexLine} className={styles.thTable}>
                        <td>
                          <p className={styles.likertQuestion}>{row.value}</p>
                        </td>
                        {modalContent.options.columns?.map(
                          (column: any, indexQuestion: number) => {
                            return (
                              <td
                                key={indexQuestion}
                                className={styles.tdContainer}
                              >
                                <Radio
                                  className={styles.likertQuestion}
                                  disabled
                                />
                              </td>
                            );
                          }
                        )}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
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
        <Tooltip title="Filtre por turmas e/ou usuários">
          <div className={styles.filterContainer}>
            <div className={styles.filterBody}>
              <p>Turmas:</p>
              <div className={styles.filterDiv}>
                <Select
                  mode="multiple"
                  className={styles.select}
                  allowClear
                  placeholder="Selecione as turmas"
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    setFilterClass(value);
                  }}
                  value={filterClass}
                  onDeselect={(value) => {
                    setFilterUser([]);
                  }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    return (
                      option?.key.toLowerCase().indexOf(input.toLowerCase()) >=
                        0 ||
                      option?.title
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  }}
                >
                  {filter.classes?.map((classItem: any) => {
                    return (
                      <option
                        key={classItem.id}
                        value={classItem.id}
                        title={`${classItem.name} - ${classItem.semester}`}
                      >
                        {classItem.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            <div className={styles.filterBody}>
              <p>Alunos:</p>
              <div className={styles.filterDiv}>
                <Select
                  mode="multiple"
                  className={styles.select}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    return (
                      option?.key.toLowerCase().indexOf(input.toLowerCase()) >=
                        0 ||
                      option?.title
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  }}
                  placeholder="Selecione os alunos"
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    setFilterUser(value);
                  }}
                  value={filterUser}
                >
                  {filter.users?.map((user: any) => {
                    if (filterClass.length !== 0) {
                      const userInClass = user.takenclasses?.find(
                        (takenClass: any) => {
                          return (
                            filterClass.indexOf(takenClass.subjectClass.id) > -1
                          );
                        }
                      );

                      if (!userInClass) {
                        return;
                      }
                    }

                    return (
                      <option key={user.id} value={user.id} title={user.name}>
                        {user.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>
          </div>
        </Tooltip>
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
                          <p
                            className={styles.viewQuestion}
                            onClick={() => {
                              setModalContent(question);
                              setIsModalOpen(true);
                            }}
                          >
                            Ver pergunta
                          </p>
                        </div>
                        <div className={styles.questionContainer}>
                          {question.QuestionResponse.length > 0 ? (
                            renderChart(question.QuestionResponse, question)
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
      <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
        {renderModal()}
      </Modal>
    </div>
  );
};

export default AnalysesIndicator;
