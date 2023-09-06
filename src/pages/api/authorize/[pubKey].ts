import type { NextApiRequest, NextApiResponse } from 'next'
import { mnemonicToAccount } from 'viem/accounts'

import { AppAuthType } from '../../../types/app-auth'

// https://warpcast.notion.site/Signer-Request-API-Migration-Guide-Public-9e74827f9070442fb6f2a7ffe7226b3c

type SignerEndpointQuery = {
  pubKey: string
}

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
} as const

const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
] as const

// { name: 'requestFid', type: 'uint256' },
//   { name: 'requestSigner', type: 'address' },
//   { name: 'signature', type: 'bytes' },
//   { name: 'deadline', type: 'uint256' },

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<AppAuthType>
): Promise<void> {
  const { pubKey } = req.query as SignerEndpointQuery

  const appFid = process.env.FC_APP_FID!
  const account = mnemonicToAccount(process.env.FC_APP_MNENOMIC!)

  const deadline = Math.floor(Date.now() / 1000) + 86400 // signature is valid for 1 day
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: 'SignedKeyRequest',
    message: {
      requestFid: BigInt(appFid),
      key: `0x${pubKey}`,
      deadline: BigInt(deadline),
    },
  })

  res.json({
    signature,
    requestFid: parseInt(appFid),
    requestSigner: account.address,
    deadline,
  })
}
