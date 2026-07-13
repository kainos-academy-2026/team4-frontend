import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { createDemoToken } from "../../src/auth/session";
import { getHome } from "../../src/controllers/homeController";

describe("getHome", () => {
  it("renders the index view", () => {
    const render = vi.fn();
    const request = {
      headers: {
        cookie: `demoAuthToken=${createDemoToken("test@test.com", "applicant")}`,
      },
    } as unknown as Request;

    getHome(request, { render } as unknown as Response);

    expect(render).toHaveBeenCalledWith("index", {
      authEmail: "test@test.com",
      demoAuthEnabled: false,
      isAuthenticated: true,
    });
  });
});