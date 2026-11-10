import type { Capture } from '../../shared/captures/contracts';
import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  PreviewButton,
} from './home.styles';

export function CaptureCard({ capture }: { capture: Capture }) {
  return (
    <Card>
      <PreviewButton
        aria-label={`Annotate ${capture.title}`}
        onClick={() => void window.screenMe.openAnnotation(capture.id)}
      >
        <img src={capture.displayImageUrl} alt="" />
      </PreviewButton>
      <CardBody>
        <CardTitle>{capture.title}</CardTitle>
        <CardMeta>
          <span>{capture.source === 'app' ? 'Screen Me' : 'macOS screenshot'}</span>
          <time dateTime={capture.createdAt}>
            {new Date(capture.createdAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        </CardMeta>
      </CardBody>
    </Card>
  );
}
