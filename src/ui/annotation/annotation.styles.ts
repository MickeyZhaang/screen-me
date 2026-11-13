import styled from "styled-components";

export const Page = styled.main`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.dark};
`;

export const Toolbar = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 68px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 19, 18, 0.96);
`;

export const Brand = styled.div`
  min-width: 160px;
  margin-right: 12px;

  strong {
    display: block;
    font-size: 14px;
  }

  span {
    display: block;
    overflow: hidden;
    max-width: 220px;
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ToolButton = styled.button<{ $active?: boolean }>`
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(255, 91, 53, 0.9)" : "rgba(255, 255, 255, 0.15)"};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ $active }) =>
    $active ? "rgba(255, 91, 53, 0.18)" : "rgba(255, 255, 255, 0.05)"};
  font-size: 12px;
  font-weight: 750;

  &:hover {
    background: rgba(255, 255, 255, 0.11);
  }
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const SaveButton = styled.button`
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 850;

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
`;

export const Workspace = styled.section`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background:
    radial-gradient(
      circle at 50% 20%,
      rgba(255, 255, 255, 0.08),
      transparent 42%
    ),
    #11100f;
`;

export const CanvasFrame = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  overflow: hidden;
  background: #262320;
  box-shadow: ${({ theme }) => theme.shadow.floating};

  > img {
    position: absolute;
    z-index: 0;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .canvas-container {
    position: absolute !important;
    z-index: 1;
    inset: 0;
  }
`;

export const Loading = styled.div`
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
`;

export const ErrorMessage = styled.div`
  max-width: 560px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 91, 53, 0.35);
  border-radius: ${({ theme }) => theme.radius.medium};
  color: #ffb8a7;
  background: rgba(255, 91, 53, 0.08);
  line-height: 1.5;
`;
