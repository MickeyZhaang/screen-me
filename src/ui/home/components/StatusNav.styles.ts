import styled from 'styled-components';

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 62px;
  padding: 0 clamp(20px, 4vw, 56px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  background: rgba(255, 253, 248, 0.92);
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const Mark = styled.span`
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 7px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.ink};
  font-size: 13px;
`;

export const Statuses = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 680px) {
    gap: 4px;
  }
`;

export const Status = styled.div<{ $tone: 'good' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 12px;
  font-weight: 650;

  @media (max-width: 680px) {
    padding: 0 8px;

    span:last-child {
      display: none;
    }
  }
`;

export const Dot = styled.span<{ $tone: 'good' | 'warning' }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme, $tone }) =>
    $tone === 'good' ? theme.colors.success : theme.colors.warning};
`;

export const WatcherLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
`;

export const Watcher = styled.input`
  appearance: none;
  width: 26px;
  height: 16px;
  margin: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.line};
  transition: background 160ms ease;

  &::after {
    display: block;
    width: 12px;
    height: 12px;
    margin: 2px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    content: '';
    transition: transform 160ms ease;
  }

  &:checked {
    background: ${({ theme }) => theme.colors.success};
  }

  &:checked::after {
    transform: translateX(10px);
  }
`;
