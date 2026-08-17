const MAX_VARIANTS = 64;

const ALTERNATIVES: Record<string, string[]> = {
  c: ["c", "č", "ć"],
  s: ["s", "š"],
  z: ["z", "ž"],
  d: ["d", "đ"],
  č: ["č", "c"],
  ć: ["ć", "c"],
  š: ["š", "s"],
  ž: ["ž", "z"],
  đ: ["đ", "dj", "d"],
};

function expandSearchTerm(term: string): string[] {
  const lower = term.toLowerCase();
  let variants: string[] = [""];

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i] ?? "";
    let alternatives: string[];
    if (lower.startsWith("dj", i)) {
      alternatives = ["dj", "đ"];
      i++; // account for the "j"
    } else {
      alternatives = ALTERNATIVES[char] ?? [char];
    }
    const usable =
      variants.length * alternatives.length > MAX_VARIANTS
        ? alternatives.slice(0, 1)
        : alternatives;
    variants = variants.flatMap((variant) =>
      usable.map((alternative) => variant + alternative),
    );
  }

  return [...new Set([lower, ...variants])];
}

export { expandSearchTerm };
