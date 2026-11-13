import { describe, expect, it } from "vitest";
import { SaveAnnotationInputSchema } from "./contracts";
import { maxAnnotationBytes } from "./limits";

const captureId = "a6e1e91c-1576-4a91-a609-e83a1bfcef99";

describe("SaveAnnotationInputSchema", () => {
  it("rejects annotation documents larger than the configured limit", () => {
    expect(() =>
      SaveAnnotationInputSchema.parse({
        captureId,
        annotationJson: "a".repeat(maxAnnotationBytes + 1),
        renderedDataUrl: "data:image/png;base64,cG5n",
      }),
    ).toThrow();
  });

  it("rejects non-PNG rendered data URLs", () => {
    expect(() =>
      SaveAnnotationInputSchema.parse({
        captureId,
        annotationJson: '{"canvas":{"objects":[]}}',
        renderedDataUrl: "data:image/jpeg;base64,cG5n",
      }),
    ).toThrow();
  });
});
