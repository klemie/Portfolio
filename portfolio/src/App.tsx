import * as React from 'react'

import { ChakraProvider, extendTheme, Text } from '@chakra-ui/react'
import LandingPage from './views/LandingPage';
import '@fontsource/merriweather';

function App() {
  const theme = extendTheme({
    fonts: {
      heading: `'Merriweather'`,
      body: `'Merriweather'`
    },
    colors: {
      brand: {
        100: '#f7fafc',
        // ...
      }
    }
  });

  return (
    <ChakraProvider theme={theme}>
      <LandingPage />
    </ChakraProvider>
  )
}

export default App;