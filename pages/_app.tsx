import '../styles/globals.css'
import { storeWrapper } from "../store";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default storeWrapper.withRedux(MyApp);