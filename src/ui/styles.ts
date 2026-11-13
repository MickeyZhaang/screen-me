import { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    ink: "#1d1b19",
    muted: "#6d675f",
    canvas: "#f4f1ea",
    surface: "#fffdf8",
    line: "#ded8ce",
    accent: "#ff5b35",
    accentDark: "#d93f1b",
    dark: "#171614",
    white: "#ffffff",
    success: "#257457",
    warning: "#8b6414",
    error: "#a63c31",
  },
  radius: {
    small: "8px",
    medium: "14px",
    large: "22px",
  },
  shadow: {
    card: "0 16px 40px rgba(42, 35, 29, 0.08)",
    floating: "0 18px 60px rgba(0, 0, 0, 0.28)",
  },
};

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
    margin: 0;
  }

  body {
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.canvas};
    font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  button,
  input,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }
`;
