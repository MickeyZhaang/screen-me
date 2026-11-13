import styled from 'styled-components';

export const AppFrame = styled.main`
  min-height: 100vh;
  overflow: hidden;
  background: #f6f4f0;
`;

export const AppShell = styled.div`
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  min-height: 100vh;

  @media (max-width: 760px) {
    grid-template-columns: 184px minmax(0, 1fr);
  }
`;

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 22px 18px 18px;
  background: #fdfcfa;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Mark = styled.span`
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: #131210;
  font-size: 16px;
  font-weight: 700;
`;

export const BrandName = styled.span`
  color: #131210;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.035em;
`;

export const LibraryLabel = styled.p`
  margin: 20px 0 0;
  color: #6e665c;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
`;

export const LibraryNav = styled.nav`
  display: grid;
  gap: 2px;
`;

export const LibraryItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  color: ${({ $active }) => ($active ? '#131210' : '#6e665c')};
  background: ${({ $active }) => ($active ? '#e8e3d9' : 'transparent')};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  text-align: left;

  &:not(:disabled):hover {
    background: #f1eee8;
  }

  &:disabled {
    cursor: default;
  }
`;

export const NavLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const NavDot = styled.img`
  width: 8px;
  height: 8px;
`;

export const Count = styled.span`
  color: #6e665c;
  font-size: 12px;
  font-weight: 500;
`;

export const SidebarStatus = styled.div`
  display: grid;
  gap: 8px;
  margin-top: auto;
  color: #6e665c;
  font-size: 12px;

  p {
    margin: 0;
  }
`;

export const ScreenStatus = styled.p<{ $granted: boolean }>`
  color: ${({ $granted }) => ($granted ? '#1a754d' : '#8b6414')};
`;

export const MainContent = styled.section`
  display: grid;
  grid-template-rows: 77px minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  background: #fff;
`;

export const Toolbar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 28px;
  border-bottom: 1px solid #dbd6cc;
  background: #f6f4f0;
`;

export const ToolbarTitle = styled.div`
  h1 {
    margin: 0;
    color: #131210;
    font-size: 28px;
    letter-spacing: -0.035em;
    line-height: 1.15;
  }

  p {
    margin: 2px 0 0;
    color: #6e665c;
    font-size: 13px;
  }
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const WatcherButton = styled.button<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #dbd6cc;
  border-radius: 10px;
  color: #6e665c;
  background: #fff;
  font-size: 13px;

  &::before {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $enabled }) => ($enabled ? '#1a754d' : '#8b8278')};
    content: '';
  }
`;

export const CaptureButton = styled.button`
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 11px;
  color: #fff;
  background: #131210;
  font-size: 13px;
  font-weight: 600;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`;

export const Canvas = styled.section`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 24px;
  min-height: 0;
  padding: 28px;
`;

export const HelperRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #6e665c;
  font-size: 13px;

  p {
    margin: 0;
  }

  strong {
    color: #131210;
    font-weight: 500;
  }
`;

export const CaptureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  align-content: start;
  gap: 16px;
  overflow: auto;
  min-height: 0;
`;

export const EmptyState = styled.section`
  display: grid;
  min-height: 0;
  place-items: center;
  padding: 28px;
  border: 1px dashed #dbd6cc;
  border-radius: 16px;
  background: #fdfcfa;
  text-align: center;
`;

export const EmptyContent = styled.div`
  max-width: 430px;

  h2 {
    margin: 12px 0 8px;
    color: #131210;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: #6e665c;
    font-size: 14px;
    line-height: 1.5;
  }
`;

export const EmptyIcon = styled.div`
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  place-items: center;
  border-radius: 18px;
  background: #e8e3d9;

  span {
    width: 30px;
    height: 22px;
    border: 2px solid #131210;
    border-radius: 5px;
  }
`;

export const EmptyActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
`;

export const SecondaryButton = styled.button`
  min-height: 36px;
  padding: 0 15px;
  border: 1px solid #dbd6cc;
  border-radius: 10px;
  color: #131210;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
`;

export const ErrorBanner = styled.div`
  position: absolute;
  right: 28px;
  bottom: 28px;
  max-width: 420px;
  padding: 12px 14px;
  border: 1px solid rgba(166, 60, 49, 0.25);
  border-radius: 10px;
  color: #a63c31;
  background: #fff4f1;
  font-size: 13px;
`;
