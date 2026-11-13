import styled from 'styled-components';

export const Page = styled.main`
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: clamp(44px, 7vw, 88px) clamp(20px, 4vw, 56px) 80px;
`;

export const Hero = styled.header`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 48px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  @media (max-width: 620px) {
    align-items: start;
    flex-direction: column;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  max-width: 620px;
  margin: 0;
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 650;
  letter-spacing: -0.065em;
  line-height: 0.95;
`;

export const TitleAccent = styled.span`
  color: ${({ theme }) => theme.colors.muted};
`;

export const CaptureButton = styled.button`
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.ink};
  box-shadow: 0 10px 26px rgba(29, 27, 25, 0.16);
  font-size: 14px;
  font-weight: 750;
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: #000;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
`;

export const InboxHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin: 34px 0 18px;

  h2 {
    margin: 0;
    font-size: 18px;
    letter-spacing: -0.035em;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
  }
`;

export const ErrorBanner = styled.div`
  margin-top: 22px;
  padding: 13px 15px;
  border: 1px solid rgba(166, 60, 49, 0.25);
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.error};
  background: rgba(255, 244, 241, 0.9);
  font-size: 14px;
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
`;

export const Card = styled.article`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.card};
    transform: translateY(-2px);
  }
`;

export const PreviewButton = styled.button`
  display: block;
  width: 100%;
  height: 184px;
  padding: 0;
  border: 0;
  background: #e8e4dd;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CardBody = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 14px;
`;

export const CardTitle = styled.h2`
  overflow: hidden;
  margin: 0 0 6px;
  font-size: 14px;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardMeta = styled.div`
  display: flex;
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`;

export const DeleteButton = styled.button`
  align-self: center;
  padding: 5px 0;
  border: 0;
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;
  font-size: 12px;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const Empty = styled.section`
  display: grid;
  min-height: 260px;
  place-items: center;
  padding: 36px;
  border: 1px dashed ${({ theme }) => theme.colors.line};
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;

  strong {
    display: block;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.ink};
    font-size: 17px;
  }
`;

export const More = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 26px;
`;
