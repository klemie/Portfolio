import * as React from 'react'

import { ChakraProvider, Container, extendTheme, Text } from '@chakra-ui/react'
import LandingPage from './views/LandingPage';
import '@fontsource/merriweather';
import '@fontsource-variable/karla';

function App() {
  const theme = extendTheme({
    fonts: {
      heading: `'Merriweather'`,
      body: `'Karla Variable'`
    },
    colors: {
      brand: {
        100: '#f7fafc',
        // ...
      }
    }
  });

  return (
    <Container w={'100vw'} h={'100vh'} bg={'#F8F3EE'} margin={0} padding={0}>
      <ChakraProvider theme={theme}>
        <LandingPage />
      </ChakraProvider>
    </Container>
  )
}

export default App;