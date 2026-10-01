import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("test setup", () => {
  it("runs TypeScript tests with the app path alias", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
