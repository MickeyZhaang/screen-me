import styled from 'styled-components';
import type { Capture } from '../../shared/captures/contracts';

const Card = styled.article`
  overflow: hidden;
  border: 1px solid #dbd6cc;
  border-radius: 12px;
  background: #fdfcfa;
`;

const Preview = styled.button`
  display: block;
  width: 100%;
  height: 168px;
  padding: 0;
  border: 0;
  background: #e8e3d9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
`;

const Details = styled.div`
  min-width: 0;

  h2 {
    overflow: hidden;
    margin: 0 0 4px;
    color: #131210;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 0;
    color: #6e665c;
    font-size: 12px;
  }
`;

const Delete = styled.button`
  padding: 4px 0;
  border: 0;
  color: #6e665c;
  background: transparent;
  font-size: 12px;

  &:hover {
    color: #a63c31;
  }
`;

export function CaptureCard({
  capture,
  onDelete,
}: {
  capture: Capture;
  onDelete(captureId: string): void;
}) {
  const home = window.screenMe.home;

  return (
    <Card>
      <Preview
        aria-label={`Annotate ${capture.title}`}
        onClick={() => void home?.openAnnotation(capture.id)}
      >
        <img src={capture.thumbnailImageUrl} alt="" />
      </Preview>
      <Body>
        <Details>
          <h2>{capture.title}</h2>
          <p>
            {new Date(capture.createdAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </Details>
        <Delete type="button" onClick={() => onDelete(capture.id)}>
          Delete
        </Delete>
      </Body>
    </Card>
  );
}
