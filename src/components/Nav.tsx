import { Button } from '@ensdomains/thorin'
import Link from 'next/link'
import styled from 'styled-components'

import { ConnectButton } from './ConnectButton'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`

const Title = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
`

export function Nav({ title }: { title: string }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <div className="flex">
        <Link href="/signer">
          <button>Add signer</button>
        </Link>
        <Link href="/transfer">
          <button>Transfer FID</button>
        </Link>
      </div>

      <ConnectButton size="small" />
    </Wrapper>
  )
}
