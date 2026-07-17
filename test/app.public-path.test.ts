 import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

process.env.API_BASE_URL = "http://localhost:4000";

describe("app module public static path selection", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  afterEach(() => {
    if (typeof originalApiBaseUrl === "string") {
      process.env.API_BASE_URL = originalApiBaseUrl;
    } else {
      delete process.env.API_BASE_URL;
    }

    vi.unstubAllEnvs();
    vi.doUnmock("node:fs");
    vi.resetModules();
  });

  it("throws on import when API_BASE_URL is not configured", async () => {
    vi.stubEnv("API_BASE_URL", "");

    await expect(import("../src/app")).rejects.toThrow(
      "API_BASE_URL environment variable is required",
    );
  });

  it("uses the dist public path when dist branding.css exists", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:4000");

    vi.doMock("node:fs", async () => {
      const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
      return {
        ...actual,
        default: { ...actual, existsSync: vi.fn(() => true) },
        existsSync: vi.fn(() => true),
      };
    });

    const { resolvePublicPath } = await import("../src/app");
    const distPath = "/tmp/dist/public";
    const sourcePath = "/tmp/source/public";
    const fsModule = await import("node:fs");

    const selectedPath = resolvePublicPath(distPath, sourcePath, fsModule);

    expect(selectedPath).toBe(distPath);
    expect(fsModule.existsSync).toHaveBeenCalledWith(path.join(distPath, "styles", "branding.css"));
    expect(fsModule.existsSync).toHaveBeenCalledWith("/tmp/dist/public/styles/branding.css");
  });

  it("falls back to the source public path when dist branding.css does not exist", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:4000");

    vi.doMock("node:fs", async () => {
      const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
      return {
        ...actual,
        default: { ...actual, existsSync: vi.fn(() => false) },
        existsSync: vi.fn(() => false),
      };
    });

    const { resolvePublicPath } = await import("../src/app");
    const distPath = "/tmp/dist/public";
    const sourcePath = "/tmp/source/public";
    const fsModule = await import("node:fs");

    const selectedPath = resolvePublicPath(distPath, sourcePath, fsModule);

    expect(selectedPath).toBe(sourcePath);
    expect(fsModule.existsSync).toHaveBeenCalledWith(path.join(distPath, "styles", "branding.css"));
    expect(fsModule.existsSync).toHaveBeenCalledWith("/tmp/dist/public/styles/branding.css");
  });
});