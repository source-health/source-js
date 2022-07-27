import React, { ChakraProvider } from '@chakra-ui/react'
import { Source, TokenProvider } from '@source-health/source-js'
import type { Appearance } from '@source-health/source-js/dist/types'
import { useEffect, useRef } from 'react'

const themes: Record<string, Appearance['variables']> = {
  default: {
    colorSurface: '#f7f9fb',
    colorPrimary: '#4E46DC',
  },
  flat: {
    colorSurface: '#fff',
    colorPrimary: '#000',
    borderRadius: '0px',
  },
}

const source = new Source({
  domain: 'http://localhost:3002',
  authentication: new TokenProvider(() =>
    fetch('/api/source-token')
      .then((res) => res.json())
      .then((res) => res.token),
  ),
  appearance: {
    variables: themes.default,
  },
})

export default function Home() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const sourceEl = source.element('scheduler', {
      appointmentType: 'intake_consult',
    })
    sourceEl.mount(containerRef.current)
    sourceEl.on('ready', () => {
      console.log('element is ready')
    })

    sourceEl.on('booked', (appt) => {
      console.log(appt)
    })

    const timer = setTimeout(() => {
      source.update({
        appearance: {
          variables: {
            colorSurface: '#fff',
            colorPrimary: '#4E46DC',
            borderRadius: '0px',
          },
        },
      })
    }, 5000)

    return () => {
      sourceEl.unmount()
      clearInterval(timer)
    }
  }, [])

  return (
    <ChakraProvider>
      <div ref={containerRef} />
    </ChakraProvider>
  )
}
