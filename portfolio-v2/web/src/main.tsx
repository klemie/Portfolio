import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
// Globals before `./App`, deliberately: the bundler emits CSS in import-graph
// order, so importing App first would put every component's stylesheet ahead of
// the reset and shared classes they are meant to build on.
// Tokens, then the reset, then the classes shared between components. Component
// styles are imported by the components themselves.
import './index.css'
import './styles/base.css'
import './styles/primitives.css'
import {App} from './App'
import {storedTheme} from './hooks/useTheme'

const initialTheme = storedTheme()
if (initialTheme) document.documentElement.dataset.theme = initialTheme

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
