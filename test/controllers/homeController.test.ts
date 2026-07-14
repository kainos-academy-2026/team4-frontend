import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { getHome } from "../../src/controllers/homeController";

describe("getHome", () => {
  it("renders logged-out state when no auth cookie is present", () => {
    const render = vi.fn();

    getHome(
      { headers: {} } as Request,
      {
        locals: {
          isAuthenticated: false,
          userEmail: null,
        },
        render,
      } as unknown as Response,
    );

    expect(render).toHaveBeenCalledWith("index", {
      isAuthenticated: false,
      userEmail: null,
    });
  });

  it("renders logged-in state when access token cookie is present", () => {
    const render = vi.fn();
    const jwtPayload = Buffer.from(
      JSON.stringify({ email: "test@example.com" }),
    ).toString("base64url");
    const token = `header.${jwtPayload}.signature`;

    getHome(
      {
        headers: {
          cookie: `access_token=${token}`,
        },
      } as Request,
      {
        locals: {
          isAuthenticated: true,
          userEmail: "test@example.com",
        },
        render,
      } as unknown as Response,
    );

    expect(render).toHaveBeenCalledWith("index", {
      isAuthenticated: true,
      userEmail: "test@example.com",
    });
  });
});