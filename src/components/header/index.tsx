import { SmileFilled } from "@ant-design/icons";
import Image from "next/image";
import styles from "./styles.module.css";

export function Header() {
  return (
    <div className={styles.header}>
      <Image
        className={styles.imgSide}
        src="/unba3m.svg"
        alt="UnB + A3M imagem"
        width="128"
        height="76"
      />

      <SmileFilled style={{ fontSize: "48px", color: "#C4C4C4" }} />
    </div>
  );
}
