import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("app module coverage", () => {
  afterEach(() => {
    vi.doUnmock("node:fs");
    vi.resetModules();
  });

  it("uses the dist public path when dist branding.css exists", async () => {
    vi.doMock("node:fs", async () => {
      const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
      return {
        ...actual,
        default: {
          ...(actual as unknown as { default?: Record<string, unknown> }).default,
          existsSync: vi.fn(() => true),
        },
        existsSync: vi.fn(() => true),
      };
    });

    const { default: app } = await import("../src/app");
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
  });
});