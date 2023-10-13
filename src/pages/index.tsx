import { Heading, Helper, Spinner, Typography, mq } from '@ensdomains/thorin'
import Head from 'next/head'
import { useState } from 'react'
import styled, { css } from 'styled-components'
import { encodeAbiParameters } from 'viem'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useDisconnect,
  usePrepareContractWrite,
} from 'wagmi'

import { ConnectButton } from '../components/ConnectButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { Container, Layout } from '../components/atoms'
import { ID_REGISTRY, KEY_REGISTRY } from '../contracts'
import { useIsMounted } from '../hooks/useIsMounted'
import { Keypair, generateKeyPair } from '../lib/crypto'
import { AppAuthType } from '../types/app-auth'

const Wrapper = styled.div(
  ({ theme }) => css`
    gap: ${theme.space['4']};
    display: flex;
    text-align: center;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  `
)

const Title = styled(Heading)`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03125rem;
  line-height: 1.1;

  ${mq.sm.min(css`
    font-size: 2.5rem;
  `)}
`

const Description = styled(Typography)(
  ({ theme }) => css`
    line-height: 1.4;
    color: ${theme.colors.grey};
    font-size: ${theme.fontSizes.large};
  `
)

// struct SignedKeyRequestMetadata {
//   uint256 requestFid;
//   address requestSigner;
//   bytes signature;
//   uint256 deadline;
// }
const SIGNED_KEY_REQUEST_TYPE_V2 = [
  {
    components: [
      {
        internalType: 'uint256',
        name: 'requestFid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'requestSigner',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    internalType: 'struct SignedKeyRequestValidator.SignedKeyRequestMetadata',
    name: 'metadata',
    type: 'tuple',
  },
] as const

export default function Home() {
  return (
    <>
      <Head>
        <title>Farcaster Signer Add</title>
        <meta
          name="description"
          content="Easily set a recovery address for your Farcaster account"
        />

        <meta property="og:image" content="" />
        <meta property="og:title" content="Farcaster Account Recovery" />
        <meta
          property="og:description"
          content="Easily set a recovery address for your Farcaster account"
        />
      </Head>

      <Layout>
        <Nav title="Home" />

        <Container as="main">
          {/* Nav buttons that go to /signer and /transfer */}
        </Container>

        <Footer />
      </Layout>
    </>
  )
}
