import React, { ChakraProvider } from '@chakra-ui/react'
import { Source, TokenProvider } from '@source-health/source-js'
import type { Appearance } from '@source-health/source-js/dist/types'
import { useRouter } from 'next/router'
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

export default function FormPage() {
  const router = useRouter()
  const form = router.query.formId as string
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const sourceEl = source.element('form', {
      form,
    })
    sourceEl.mount(containerRef.current)
    sourceEl.on('ready', () => {
      console.log('element is ready')
    })

    sourceEl.on('submitted', (formResponseId) => {
      console.log(formResponseId)
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
  }, [form])

  return (
    <ChakraProvider>
      <div ref={containerRef} />
    </ChakraProvider>
  )
}
