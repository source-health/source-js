import { ChakraProvider, Stack, Button, Box } from '@chakra-ui/react'
import type { BookingElement } from '@source-health/js'
import {
  Source,
  SourceEnvironment,
  StaticAuthentication,
} from '@source-health/js'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const source = new Source({
  environment: SourceEnvironment.Staging,
  authentication: new StaticAuthentication('asdf'),
})

export default function Home() {
  const [element, setElement] = useState<BookingElement | null>(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const sourceEl = source.element('booking', { appointmentType: ' ' })
    sourceEl.mount(containerRef.current)

    setElement(sourceEl)

    return () => sourceEl.unmount()
  }, [])

  const onClick = useCallback(
    (appointmentType: string) => {
      element?.update({
        appointmentType,
      })
    },
    [element],
  )

  return (
    <ChakraProvider>
      <Stack direction="column" flex="1" spacing={6} alignItems="center">
        <Button onClick={() => onClick('intake')}>Intake Visit</Button>
        <Button onClick={() => onClick('check in')}>Check In Visit</Button>
      </Stack>
      <Box border="1px">
        <div ref={containerRef} />
      </Box>
    </ChakraProvider>
  )
}
