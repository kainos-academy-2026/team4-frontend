 import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

process.env.API_BASE_URL = "http://localhost:4000";

describe("app module public static path selection", () => {
  afterEach(() => {
    vi.doUnmock("node:fs");
    vi.resetModules();
  });

  it("uses the dist public path when dist branding.css exists", async () => {
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