import { Heading, Helper, Spinner, Typography, mq } from '@ensdomains/thorin'
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import { Address, TypedDataDomain } from 'viem'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useDisconnect,
  usePrepareContractWrite,
  useSignTypedData,
} from 'wagmi'

import { ConnectButton } from '../components/ConnectButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { Container, Layout } from '../components/atoms'
import { ID_REGISTRY } from '../contracts'
import { useIsMounted } from '../hooks/useIsMounted'

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

const TRANSFER_TYPEHASH =
  '0xcdbe3d2a782931ab7e1b568857680f9812900b4702ab75d82ddfd270aaf595f5'

const ID_REGISTRY_EIP_712_DOMAIN = {
  name: 'Farcaster IdRegistry',
  version: '1',
  chainId: 10,
  verifyingContract: '0x00000000fcaf86937e41ba038b4fa40baa4b780a',
} as const

export const ID_REGISTRY_TRANSFER_TYPE = [
  { name: 'fid', type: 'uint256' },
  { name: 'to', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
] as const

export default function TransferPage() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const [currentOwner, setCurrentOwner] = useState<Address | null>(null)
  const [newOwner, setNewOwner] = useState<Address>()

  const [fidToTransfer, setFidToTransfer] = useState<bigint | null>(null)

  const { data: idOf, isLoading: idOfLoading } = useContractRead({
    ...ID_REGISTRY,
    chainId: 10,
    functionName: isMounted && isConnected ? 'idOf' : undefined,
    args: address ? [address] : undefined,
  })

  const { data: currentNonce, isLoading: currentNonceLoading } =
    useContractRead({
      ...ID_REGISTRY,
      chainId: 10,
      functionName: newOwner ? 'nonces' : undefined,
      args: newOwner ? [newOwner] : undefined,
    })

  const deadline: number = useMemo(
    () => Math.floor(Date.now() / 1000) + 86400,
    []
  )

  const {
    data: signature,
    isError: isSignatureError,
    isLoading: isSignatureLoading,
    isSuccess: isSignatureSuccess,
    signTypedData: sign,
  } = useSignTypedData({
    domain: ID_REGISTRY_EIP_712_DOMAIN,
    types: {
      Transfer: ID_REGISTRY_TRANSFER_TYPE,
    },
    primaryType: 'Transfer',
    message: {
      fid: fidToTransfer || BigInt(0),
      nonce: currentNonce || BigInt(0),
      deadline: BigInt(deadline),
      to: newOwner ?? '0x00',
    },
  })

  const [storedSignature, setStoredSignature] = useState<`0x${string}` | null>(
    null
  )

  useEffect(() => {
    if (signature) {
      setStoredSignature(signature)
    }
  }, [signature])

  const { config: transferFidConfig, error: transferFidError } =
    usePrepareContractWrite({
      ...ID_REGISTRY,
      chainId: 10,
      functionName: 'transfer',
      args:
        newOwner && !!deadline && storedSignature
          ? [newOwner, BigInt(deadline), storedSignature]
          : undefined,
      enabled: !!(currentOwner === address && storedSignature),
    })

  const {
    write: transferFid,
    data: transferFidResult,
    isLoading: transferFidLoading,
  } = useContractWrite(transferFidConfig)

  return (
    <>
      <Head>
        <title>Farcaster Transfer FID</title>
        <meta
          name="description"
          content="Easily transfer ownership of your Farcaster ID"
        />

        <meta property="og:image" content="" />
        <meta property="og:title" content="Farcaster Transfer FID" />
        <meta
          property="og:description"
          content="Easily transfer ownership of your Farcaster ID"
        />
      </Head>

      <Layout>
        <Nav title="Transfer FID" />

        <Container as="main">
          {address || currentOwner ? (
            <div>
              {idOf ? (
                <div>Your FID is: {idOf.toString()}</div>
              ) : (
                <div>This account does not have an FID</div>
              )}
              {idOf && fidToTransfer !== idOf && address ? (
                <div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      setFidToTransfer(idOf)
                      setCurrentOwner(address)
                    }}
                  >
                    Transfer
                  </button>
                </div>
              ) : null}
              {!!fidToTransfer ? (
                <div>
                  <div>The selected FID is: {fidToTransfer.toString()}</div>
                  <div>Connect the account you would like to transfer to</div>
                  <ConnectButton />

                  {address && newOwner !== address && (
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => {
                        setNewOwner(address)
                      }}
                    >
                      Confirm
                    </button>
                  )}
                </div>
              ) : null}

              {currentOwner &&
              newOwner &&
              newOwner === address &&
              fidToTransfer &&
              !storedSignature &&
              !!!transferFid ? (
                <div>
                  <div>Sign the following message with your wallet</div>
                  <div>
                    <code>
                      {JSON.stringify(
                        {
                          domain: ID_REGISTRY_EIP_712_DOMAIN,
                          types: {
                            Transfer: ID_REGISTRY_TRANSFER_TYPE,
                          },
                          primaryType: 'Transfer',
                          message: {
                            fid: fidToTransfer || BigInt(0),
                            nonce: currentNonce || BigInt(0),
                            deadline: BigInt(deadline),
                            to: newOwner ?? '0x00',
                          },
                        },
                        (_: any, value: any) =>
                          typeof value === 'bigint' ? value.toString() : value,
                        2
                      )}
                    </code>
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      sign()
                    }}
                  >
                    Sign
                  </button>
                </div>
              ) : null}

              {newOwner && storedSignature && (
                <div>
                  <div>New owner address: {newOwner}</div>
                  <div>{storedSignature}</div>
                  <div>
                    <code>
                      {JSON.stringify(
                        [newOwner, deadline, storedSignature],
                        null,
                        2
                      )}
                    </code>
                  </div>
                  {address !== currentOwner ? (
                    <div>
                      <div>
                        Connect the account that currently owns the FID (
                        {currentOwner})
                      </div>
                      <ConnectButton />
                    </div>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => {
                        transferFid?.()
                      }}
                    >
                      Transfer
                    </button>
                  )}
                </div>
              )}
              {/* {transferFidLoading && <div>Transferring FID...</div>}
              {transferFidResult && (
                <div>Transfer complete {transferFidResult.hash}</div>
              )} */}
            </div>
          ) : (
            <Wrapper>
              <Title>Transfer ownership of your Farcaster ID</Title>
              <Description>
                Connect the wallet that holds your Farcaster ID
              </Description>

              {idOfLoading ? (
                <Spinner />
              ) : idOf === BigInt(0) ? (
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
