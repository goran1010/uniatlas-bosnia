interface ErrorResponseShape {
  error?: {
    message?: string;
  };
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const result = (await response.json()) as ErrorResponseShape;
    return typeof result.error?.message === "string"
      ? result.error.message
      : null;
  } catch {
    return null;
  }
}

function isExpectedFetchError(error: unknown): boolean {
  return (
    (error instanceof Error && error.message === "Server is not ready") ||
    (error instanceof DOMException && error.name === "AbortError")
  );
}

export { isExpectedFetchError, readErrorMessage };
