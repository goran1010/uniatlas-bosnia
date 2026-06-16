function normalizeName(searchTerm: string): string {
  if (typeof searchTerm !== "string") {
    throw new TypeError("Expected a string");
  }
  return searchTerm.trim().toLowerCase();
}

export { normalizeName };
