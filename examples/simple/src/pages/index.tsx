import { ChakraProvider, Stack, Button, Box } from '@chakra-ui/react'
import { Source, SourceEnvironment } from '@source-health/js'
import React, { useEffect, useRef } from 'react'

const source = new Source({
  environment: SourceEnvironment.Staging,
})

export default function Home() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const sourceEl = source.element('booking', { appointmentType: ' ' })
    sourceEl.mount(containerRef.current)
    sourceEl.on('toggle', (event) => {
      console.log('test', toggled)
    })

    return () => sourceEl.unmount()
  }, [])

  return (
    <ChakraProvider>
      <Stack direction="column" flex="1" spacing={6} alignItems="center">
        <Button>Test</Button>
        <Button>Test</Button>
      </Stack>
      <Box border="1px">
        <div ref={containerRef} />
      </Box>
    </ChakraProvider>
  )
}
