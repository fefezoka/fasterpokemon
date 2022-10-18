import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';
import { useEffect, useState } from 'react';
import '../global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
