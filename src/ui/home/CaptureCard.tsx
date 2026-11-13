import type { Capture } from "../../shared/captures/contracts";
import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  DeleteButton,
  PreviewButton,
} from "./home.styles";

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
      <PreviewButton
        aria-label={`Annotate ${capture.title}`}
        onClick={() => void home?.openAnnotation(capture.id)}
      >
        <img src={capture.thumbnailImageUrl} alt="" />
      </PreviewButton>
      <CardBody>
        <CardTitle>{capture.title}</CardTitle>
        <CardMeta>
          <span>
            {capture.source === "app" ? "Screen Me" : "macOS screenshot"}
          </span>
          <time dateTime={capture.createdAt}>
            {new Date(capture.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </CardMeta>
        <DeleteButton type="button" onClick={() => onDelete(capture.id)}>
          Delete
        </DeleteButton>
      </CardBody>
    </Card>
  );
}
