import '../styles/globals.css'
import React from 'react';
import { Provider } from 'react-redux';
import { persistor, store } from "../store";
import { PersistGate } from 'redux-persist/integration/react';
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {

  

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  )
}

export default MyApp;