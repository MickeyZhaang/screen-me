import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { AnnotationEditor } from './ui/annotation/AnnotationEditor';
import { Home } from './ui/home/Home';
import { GlobalStyle, theme } from './ui/styles';

const parameters = new URLSearchParams(window.location.search);
const mode = parameters.get('mode');
const captureId = parameters.get('captureId');

createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {mode === 'annotation' && captureId ? (
      <AnnotationEditor captureId={captureId} />
    ) : (
      <Home />
    )}
  </ThemeProvider>,
);
