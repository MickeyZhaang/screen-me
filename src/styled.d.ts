import "styled-components";
import type { theme } from "./ui/styles";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    radius: typeof theme.radius;
    shadow: typeof theme.shadow;
  }
}
