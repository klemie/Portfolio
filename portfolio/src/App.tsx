import * as React from 'react'

import { ChakraProvider, Container, extendTheme } from '@chakra-ui/react'
import '@fontsource/merriweather';
import '@fontsource-variable/karla';
import { ViewProvider } from './utils/ViewContext';
import PageRender from './views/PageRender';

function App() {
  const theme = extendTheme({
    fonts: {
      heading: `'Merriweather'`,
      body: `'Karla Variable'`
    },
    colors: {
      about: "#1F77CB",
      projects: "#5894CE",
      experience: "#B75950",
      contact: "#F3C46A"
    }
  });

  return (
    <Container w={'100vw'} h={'100vh'} bg={'#F8F3EE'} margin={0} padding={0}>
      <ChakraProvider theme={theme}>
        <ViewProvider>
          <PageRender />
        </ViewProvider>
      </ChakraProvider>
    </Container>
  )
}

export default App;