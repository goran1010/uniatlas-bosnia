import { expandSearchTerm } from "../../../src/utils/searchVariants.js";
import { describe, test, expect } from "vitest";

describe("expandSearchTerm", () => {
  test("returns just the term when no mapped characters are present", () => {
    expect(expandSearchTerm("berlin")).toEqual(["berlin"]);
  });

  test("expands plain characters into accented variants", () => {
    const variants = expandSearchTerm("cazin");

    expect(variants).toContain("cazin");
    expect(variants).toContain("čazin");
    expect(variants).toContain("ćazin");
    expect(variants).toContain("cažin");
  });

  test("expands typed ASCII to accented spellings", () => {
    expect(expandSearchTerm("dzemal")).toContain("džemal");
  });

  test("strips accents from typed accented spellings", () => {
    expect(expandSearchTerm("džemal")).toContain("dzemal");
  });

  test("maps the dj digraph to đ", () => {
    expect(expandSearchTerm("djordje")).toContain("đorđe");
  });

  test("maps đ back to dj and d", () => {
    const variants = expandSearchTerm("đorđe");

    expect(variants).toContain("djordje");
    expect(variants).toContain("dorde");
  });

  test("lowercases the term before expanding", () => {
    const variants = expandSearchTerm("Čapljina");

    expect(variants).toContain("čapljina");
    expect(variants).toContain("capljina");
  });

  test("caps the number of variants and keeps the raw term", () => {
    const term = "c".repeat(100);
    const variants = expandSearchTerm(term);

    expect(variants.length).toBeLessThanOrEqual(65);
    expect(variants).toContain(term);
  });
});
