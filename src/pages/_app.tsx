import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig } from 'wagmi'

import { chains, wagmiConfig } from '../providers'
import '../styles/style.scss'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ThemeProvider theme={lightTheme}>
        <ThorinGlobalStyles />
        <RainbowKitProvider chains={chains} modalSize="compact">
          <Component {...pageProps} />
        </RainbowKitProvider>
      </ThemeProvider>
    </WagmiConfig>
  )
}
