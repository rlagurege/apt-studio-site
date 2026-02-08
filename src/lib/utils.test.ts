import { describe, expect, it } from "vitest";
import {
  cn,
  formatStyleTag,
  newId,
  prettyStyleTag,
  safeFilename,
} from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("filters falsy values", () => {
    expect(cn("a", undefined, "b", false)).toBe("a b");
  });
});

describe("formatStyleTag", () => {
  it("formats style tags", () => {
    expect(formatStyleTag("black_and_grey")).toBe("Black & Grey");
    expect(formatStyleTag("fine_line")).toBe("Fine Line");
  });
});

describe("prettyStyleTag", () => {
  it("replaces underscores with spaces", () => {
    expect(prettyStyleTag("neo_traditional")).toBe("neo traditional");
  });
});

describe("safeFilename", () => {
  it("sanitizes unsafe characters", () => {
    expect(safeFilename("hello world")).toBe("hello_world");
    expect(safeFilename("a/b\\c")).toBe("a_b_c");
  });
});

describe("newId", () => {
  it("returns prefix plus timestamp and random", () => {
    const id = newId("req");
    expect(id.startsWith("req_")).toBe(true);
    expect(id.split("_").length).toBeGreaterThanOrEqual(3);
  });
});
