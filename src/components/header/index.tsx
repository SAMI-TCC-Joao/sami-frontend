import { SmileFilled } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";
import { appRoutes } from "../../../constants";
import styles from "./styles.module.css";

export function Header() {
  const {
    user,
    enums: { userType },
  } = useSelector((state: any) => state);

  const router = useRouter();

  const headerOptions = {
    [userType?.teacher?.value]: [
      { label: "Indicadores", href: appRoutes.allIndicators },
      { label: "Formulários", href: appRoutes.home },
      { label: "Turmas", href: appRoutes.classes },
    ],
    [userType?.admin?.value]: [
      { label: "Professores", href: appRoutes.allTeachers },
      { label: "Cadastrar professor", href: appRoutes.registerTeacher },
      { label: "Templates", href: appRoutes.home },
    ],
  };

  const items = [{ label: "Sair", key: appRoutes.logout }];

  const onClick = (e: any) => {
    if (e.key) window.location.href = e.key;
  };

  return (
    <div className={styles.header}>
      <Image
        className={styles.imgSide}
        src="/unba3m.svg"
        alt="UnB + A3M imagem"
        width="128"
        height="76"
        onClick={() => router.push(appRoutes.home)}
      />
      <Space size={16} style={{ display: "flex", alignItems: "center" }}>
        {headerOptions[user?.userType]?.map(({ label, href }, index) => (
          <Link key={index} className={styles.link} href={`${href}`}>
            {label}
          </Link>
        ))}
        <Dropdown menu={{ items, onClick }} trigger={["click"]}>
          <SmileFilled
            style={{
              fontSize: "48px",
              color: "#C4C4C4",
              width: "100px",
              textAlign: "center",
            }}
          />
        </Dropdown>
      </Space>
    </div>
  );
}