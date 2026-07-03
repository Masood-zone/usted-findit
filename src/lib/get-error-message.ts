export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "error" in error) {
    const apiError = error as { error?: { message?: string } };
    return apiError.error?.message || fallback;
  }

  return fallback;
}
