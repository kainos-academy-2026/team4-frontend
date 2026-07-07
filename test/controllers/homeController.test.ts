import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { getHome } from "../../src/controllers/homeController";

describe("getHome", () => {
  it("renders the index view", () => {
    const render = vi.fn();

    getHome({} as Request, { render } as unknown as Response);

    expect(render).toHaveBeenCalledWith("index", {
      demoAuthEnabled: false,
    });
  });
});