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
const KEY_METADATA_TYPE_1 = [
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

export default function SignerPage() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const [keypair, setKeypair] = useState<Keypair | undefined>()
  const [appAuth, setAppAuth] = useState<AppAuthType | undefined>()

  const idOf = useContractRead({
    ...ID_REGISTRY,
    chainId: 10,
    functionName: isMounted && isConnected ? 'idOf' : undefined,
    args: address ? [address] : undefined,
  })

  const { config: addKeyConfig, error: addKeyError } = usePrepareContractWrite({
    ...KEY_REGISTRY,
    chainId: 10,
    functionName: 'add',
    args: [
      1,
      `0x${keypair?.publicKey}`,
      1,
      appAuth
        ? encodeAbiParameters(KEY_METADATA_TYPE_1, [
            {
              requestFid: BigInt(appAuth.requestFid),
              requestSigner: appAuth.requestSigner as `0x${string}`,
              signature: appAuth.signature as `0x${string}`,
              deadline: BigInt(appAuth.deadline),
            },
          ])
        : `0x00`,
    ],
    enabled: !!(keypair && appAuth),
  })

  const {
    write: addKey,
    data: addKeyResult,
    isLoading: addKeyLoading,
  } = useContractWrite(addKeyConfig)

  /**
   * This will help you create a new signer for your farcaster account for the configured fid
   * 1. generate keypair
   * 2. follow signing flow for signer metadata: https://warpcast.notion.site/Signer-Request-API-Migration-Guide-Public-9e74827f9070442fb6f2a7ffe7226b3c
   * 3. call the addKey method on the key registry contract
   */

  return (
    <>
      <Head>
        <title>Farcaster Signer Add</title>
        <meta
          name="description"
          content="Easily create new signers for your Farcaster account"
        />

        <meta property="og:image" content="" />
        <meta property="og:title" content="Farcaster Signer Creator" />
        <meta
          property="og:description"
          content="Easily create new signers for your Farcaster account"
        />
      </Head>

      <Layout>
        <Nav title="Add Signer" />

        <Container as="main">
          {!!idOf.data ? (
            <div>
              <div>Your farcaster id is: {idOf.data.toString()}</div>
              <div className="flex gap-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    generateKeyPair().then((keypair) => {
                      localStorage.setItem('keypair', JSON.stringify(keypair))
                      setKeypair(keypair)
                    })
                  }}
                >
                  Generate keypair
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    // TODO: Only show if can load keypair
                    const keypair = JSON.parse(
                      localStorage.getItem('keypair') || ''
                    )
                    if (!keypair) {
                      alert('No keypair found')
                      return
                    }
                    setKeypair(keypair)
                  }}
                >
                  Load keypair
                </button>
              </div>
              {keypair && (
                <div>
                  <div>Public key: 0x{keypair.publicKey}</div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      fetch(`/api/authorize/${keypair.publicKey}`)
                        .then((res) => res.json())
                        .then((json) => {
                          setAppAuth(json)
                        })
                    }}
                  >
                    Authorize signer
                  </button>
                </div>
              )}
              {appAuth && (
                <div className="max-w-sm break-all">
                  <div className="flex flex-col gap-2">
                    <div>App auth: {JSON.stringify(appAuth)}</div>
                  </div>
                  <button
                    onClick={() => {
                      addKey?.()
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add key
                  </button>
                </div>
              )}
              {addKeyLoading && <div>Adding key...</div>}
              {addKeyResult && <div>Key added! {addKeyResult.hash}</div>}
            </div>
          ) : (
            <Wrapper>
              <Title>Create A New Signer For Your Farcaster Account</Title>
              <Description>
                Connect the wallet that holds your Farcaster ID
              </Description>

              {idOf.isLoading ? (
                <Spinner />
              ) : idOf.data === BigInt(0) ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                    width: '100%',
                  }}
                >
                  <Helper type="warning">
                    This address does not have an FID. Import your
                    Warpcast-provided seed phrase to a wallet app and reconnect.
                  </Helper>
                  <button
                    onClick={() => disconnect?.()}
                    style={{
                      width: 'fit-content',
                      margin: '0 auto',
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <ConnectButton />
              )}
            </Wrapper>
          )}
        </Container>

        <Footer />
      </Layout>
    </>
  )
}
