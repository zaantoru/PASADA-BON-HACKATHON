/**
 * Mock service configuration. Every service in this folder is a stand-in for the
 * Express/Prisma/Lumen backend. Replace the implementations while keeping the
 * exported function signatures.
 */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
