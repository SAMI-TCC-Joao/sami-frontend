import type { NextPage } from 'next'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { Input } from '../src/components/Input'
import { userUpdate } from '../store/actions/users'
import styles from '../styles/Login.module.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const {id, token, email} = useSelector((state: any) => state.user);
  console.log({id, token, email})
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  const login = () => {
    axios.post('//localhost:3001/auth/login', {
      email: user,
      password
    })
    .then((response) => {
      console.log(response);
      dispatch(userUpdate(response?.data?.user))
    })
    .catch((error) => {
      
      console.error(error);
      toast(error?.message)
    });
  }

  return (
    <div className={styles.container}>
        <img
          src="/homeimg.svg"
          alt="Home img"
          className={styles.loginImg}
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
        <button className={styles.submitButton} onClick={login}>Entrar</button>
      </div>
    </div>
  )
}

export default Home
