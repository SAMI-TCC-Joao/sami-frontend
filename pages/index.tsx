import type { NextPage } from 'next'
import Image from 'next/image'
import { useState } from 'react'
import { Input } from '../src/components/Input'
import styles from '../styles/Login.module.css'
import axios from 'axios'

const Home: NextPage = () => {

  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  const login = () => {
    axios.post('localhost:3001/auth/login', {
      email: 'Monsen',
      password: 'teste'
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  return (
    <div className={styles.container}>
        <Image
          src="/homeimg.svg"
          alt="Home img"
          width="626"
          height="330"
        />
      <div className={styles.inputSide}>
        <div className={styles.logoText}>
          SAMI
        </div>
        <div className={styles.text}>
          Sistema para análise de métricas e <br/> indicadores de aprendizagem
        </div>
        <Input title="Usuário" type="email" onChange={e => setUser(e.target.value)}/>
        <Input title="Senha" type="password" onChange={e => setPassword(e.target.value)}/>
        <button onClick={login}>Entrar</button>
      </div>
    </div>
  )
}

export default Home
