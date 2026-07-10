import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getHealth } from "../../src/controllers/healthController";

describe("getHealth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the expected health payload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00.000Z"));

    const json = vi.fn();

    getHealth({} as Request, { json } as unknown as Response);

    expect(json).toHaveBeenCalledWith({
      status: "UP",
      time: "2026-07-06T12:00:00.000Z",
    });
  });
});