import { NextPage } from "next";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Input } from "antd";
import styles from "@/styles/Classes.module.css";
import { Header } from "../../src/components/header";
import { FilterButton } from "../../src/components/filterButton";
import ClassesTable from "../../src/components/tables/classesTable";
import DeleteClassModal from "../../src/components/modals/deleteClass";
import BackPage from "../../src/components/backPages";
import { useRouter } from "next/router";
import { appRoutes } from "../../constants";

const Classes: NextPage = () => {
  const navigate = useRouter()

  const { enums } = useSelector((state: any) => state);
  const hasEnums = Object.keys(enums).length;

  return hasEnums ? (
    <div className={styles.container}>
      <Header />

      <div className={styles.body}>
        <BackPage />

        <div className={styles.content}>
          <h1 className={styles.title}>Turmas</h1>

          <button className={styles.button} onClick={() => navigate.push(appRoutes.registerClass)}>Criar</button>
        </div>

        <div className={styles.ContainerTable}>
          <ClassesTable />
        </div>
      </div>
    </div>
  ) : null;
};

export default Classes;
