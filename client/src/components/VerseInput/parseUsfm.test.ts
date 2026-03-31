import { describe, expect, it } from "vitest";
import { parseUsfmReference } from "./parseUsfm";

describe("parseUsfmReference", () => {
  it("parses single verse", () => {
    expect(parseUsfmReference("jhn.3.16")).toEqual({ normalized: "JHN.3.16" });
  });

  it("clips multi-chapter range to first chapter", () => {
    const parsed = parseUsfmReference("JHN.3.16-4.2");
    expect(parsed.normalized).toBe("JHN.3");
    expect(parsed.warning).toContain("trimmed");
  });

  it("caps long chapter to 50 verses", () => {
    const parsed = parseUsfmReference("PSA.119");
    expect(parsed.normalized).toBe("PSA.119.1-50");
    expect(parsed.warning).toContain("first 50 verses");
  });

  it("throws for invalid format", () => {
    expect(() => parseUsfmReference("John 3:16")).toThrow(/USFM format/i);
  });
});
