import { SmileFilled } from "@ant-design/icons";
import { Dropdown } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import styles from "./styles.module.css";

export function Header() {
  const { user, enums } = useSelector((state: any) => state);
  console.log(enums)
  
  const isTeacher = user?.userType === enums?.userType?.teacher?.value;
  const items = [
    {label: 'Perfil', key: 'profile' },
  ]

  const onClick = e => {
    if(e.key) window.location.href = `/${e.key}`;
  }
  return (
    <div className={styles.header}>
      <Image
        className={styles.imgSide}
        src="/unba3m.svg"
        alt="UnB + A3M imagem"
        width="128"
        height="76"
      />
      <div>
        {isTeacher ? (
          <>
                <Link href="/">Indicadores</Link>
                <Link href="/">Formulários</Link>
                <Link href="/">Turmas</Link>

                </>
        ) : (
          <>
          <Link href="/registerClass">Cadastrar turma</Link>
          <Link href="/registerTeacher">Cadastrar professor</Link>
          </>
        )}
      <Dropdown menu={{ items, onClick }}>
        <SmileFilled style={{ fontSize: "48px", color: "#C4C4C4" }} />
      </Dropdown>
      </div>
      
    </div>
  );
}
