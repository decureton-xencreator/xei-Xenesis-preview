export class RuntimeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "RuntimeError";
  }
}

export function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown runtime error";
}
