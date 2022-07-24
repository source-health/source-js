import { Button, ChakraProvider, Stack } from '@chakra-ui/react'
import type { BookingElement } from '@source-health/js'
import { NoopAuthentication, Source } from '@source-health/js'
import { useCallback, useEffect, useRef, useState } from 'react'

const source = new Source({
  domain: 'http://localhost:3002',
  authentication: new NoopAuthentication(),
  appearance: {
    variables: {
      colorSurface: '#f9f7fa',
      colorPrimary: 'green',
    },
  },
})

export default function Home() {
  const [element, setElement] = useState<BookingElement | null>(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const sourceEl = source.element('booking', {
      appointmentType: 'intake_consult',
    })
    sourceEl.mount(containerRef.current)
    sourceEl.on('ready', () => {
      console.log('element is ready')
    })

    setElement(sourceEl)

    return () => sourceEl.unmount()
  }, [])

  const updateOptions = useCallback(
    (appointmentType: string) => {
      element?.update({
        appointmentType,
      })
    },
    [element],
  )

  const updateAppearance = useCallback((primaryColor: string) => {
    source.update({
      appearance: {
        variables: {
          colorPrimary: primaryColor,
        },
      },
    })
  }, [])

  return (
    <ChakraProvider>
      <Stack>
        <Stack direction="row" flex="1" spacing={2} alignItems="center">
          <Button onClick={() => updateOptions('intake_consult')}>
            Intake Visit
          </Button>
          <Button onClick={() => updateOptions('check_in_visit')}>
            Check In Visit
          </Button>
        </Stack>
        <Stack direction="row" flex="1" spacing={2} alignItems="center">
          <Button onClick={() => updateAppearance('black')}>Black</Button>
          <Button onClick={() => updateAppearance('green')}>Green</Button>
        </Stack>
      </Stack>
      <br />
      <br />
      <div ref={containerRef} />
    </ChakraProvider>
  )
}
