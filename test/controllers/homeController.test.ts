import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { HomeController } from "../../src/controllers/homeController";
import type { JobRoleService } from "../../src/services/jobRoleService";
import type { JobRoleListItem } from "../../src/models/jobRoleListModels";

describe("HomeController.getHome", () => {
  it("renders logged-out state when no auth cookie is present with job roles", async () => {
    const render = vi.fn();
    const mockRoles: JobRoleListItem[] = [];
    const mockService = {
      getOpenRoles: vi.fn().mockResolvedValue(mockRoles),
    } as unknown as JobRoleService;

    const controller = new HomeController(mockService);
    await controller.getHome(
      { cookies: {} } as Request,
      { render } as unknown as Response,
    );

    expect(render).toHaveBeenCalledWith("index", {
      jobRoles: mockRoles,
      errorMessage: null,
    });
  });

  it("renders the index view with an error message when service fails", async () => {
    const render = vi.fn();
    const mockService = {
      getOpenRoles: vi.fn().mockRejectedValue(new Error("Service error")),
    } as unknown as JobRoleService;

    const controller = new HomeController(mockService);
    await controller.getHome(
      { headers: {} } as Request,
      { render } as unknown as Response,
    );

    expect(render).toHaveBeenCalledWith("index", {
      jobRoles: [],
      errorMessage: "Something went wrong loading job roles. Please try again later.",
    });
  });

  it("renders the index view with job roles on success", async () => {
    const render = vi.fn();
    const mockRoles: JobRoleListItem[] = [{
      id: 1,
      roleName: "Software Engineer",
      location: "Belfast",
      capability: "Engineering",
      band: "Associate",
      closingDate: new Date("2026-08-01"),
      status: "open",
      myApplication: { status: "in_progress" },
    }];
    const mockService = {
      getOpenRoles: vi.fn().mockResolvedValue(mockRoles),
    } as unknown as JobRoleService;

    const controller = new HomeController(mockService);
    await controller.getHome(
      { cookies: { access_token: "token" } } as Request,
      { render } as unknown as Response,
    );

    expect(render).toHaveBeenCalledWith("index", {
      jobRoles: [{ ...mockRoles[0], status: "In Progress" }],
      errorMessage: null,
    });
    expect(mockService.getOpenRoles).toHaveBeenCalledWith("Bearer token");
  });
});