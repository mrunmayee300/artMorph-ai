import { describe, it, expect } from "vitest";
import { formatCredits, absoluteUrl } from "@/lib/utils";

describe("utils", () => {
  it("formats credits", () => {
    expect(formatCredits(1000)).toBe("1,000");
  });

  it("builds absolute urls", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    expect(absoluteUrl("/dashboard")).toBe("http://localhost:3000/dashboard");
  });
});
