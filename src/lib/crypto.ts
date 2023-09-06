import * as ed from '@noble/ed25519'

export type Keypair = {
  publicKey: string
  privateKey: string
}

export async function generateKeyPair(): Promise<Keypair> {
  const privateKey = ed.utils.randomPrivateKey()
  const publicKey = await ed.getPublicKeyAsync(privateKey)

  return {
    publicKey: Buffer.from(publicKey).toString('hex'),
    privateKey: Buffer.from(privateKey).toString('hex'),
  }
}
