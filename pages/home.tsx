import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { FormCard } from "../src/components/formCard";
import { Header } from "../src/components/header";
import React from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { appRoutes } from "../constants";
import { TitlePage } from "../src/components/titlePage";

const Home: NextPage = () => {
  const { forms } = useSelector((state: any) => state);

  return (
    <div className={styles.container}>
      <Head>
        <title>Home - SAMI</title>
        <meta name="Página inicial" content="Página inicial da aplicação" />
      </Head>
      <Header />
      <div className={styles.body}>
        <TitlePage title="Formulários" url={appRoutes.registerForm} />
        <div className={styles.cardsDiv}>
          {forms.forms?.map((form: any) => (
            <FormCard
              key={form.id}
              id={form.id}
              title={form.name}
              date={`${new Date(form.createdAt).toLocaleDateString()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
