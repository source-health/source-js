import { ChakraProvider } from '@chakra-ui/react'
import { Source, TokenProvider } from '@source-health/source-js'
import React, { useEffect, useRef } from 'react'

const source = new Source({
  domain: 'http://localhost:3002',
  authentication: new TokenProvider(() =>
    fetch('/api/source-token')
      .then((res) => res.json())
      .then((res) => res.token),
  ),
})

export default function Home() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const element = source.element('scheduler', {
      appointmentType: 'urgent_care_visit',
    })

    element.mount(containerRef.current)

    return () => element.unmount()
  }, [])

  return (
    <ChakraProvider>
      <div ref={containerRef} />
    </ChakraProvider>
  )
}
