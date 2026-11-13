import { describe, expect, it } from "vitest";
import { maxAnnotationObjects } from "../../shared/captures/limits";
import { validateAnnotation } from "./annotation-validator";

describe("validateAnnotation", () => {
  it("accepts an annotation canvas with a bounded object list", () => {
    expect(() =>
      validateAnnotation(JSON.stringify({ canvas: { objects: [{}] } })),
    ).not.toThrow();
  });

  it("rejects malformed and oversized annotation documents", () => {
    expect(() => validateAnnotation("{")).toThrow();
    expect(() =>
      validateAnnotation(
        JSON.stringify({
          canvas: { objects: Array.from({ length: maxAnnotationObjects + 1 }) },
        }),
      ),
    ).toThrow();
  });
});
