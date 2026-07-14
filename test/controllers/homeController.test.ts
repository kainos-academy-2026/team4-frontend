import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { HomeController } from "../../src/controllers/homeController";
import type { JobRoleService } from "../../src/services/jobRoleService";
import type { JobRoleListItem } from "../../src/models/jobRoleListModels";

describe("HomeController.getHome", () => {
  it("renders the index view with job roles", async () => {
    const render = vi.fn();
    const mockRoles: JobRoleListItem[] = [];
    const mockService = {
      getOpenRoles: vi.fn().mockResolvedValue(mockRoles),
    } as unknown as JobRoleService;

    const controller = new HomeController(mockService);
    await controller.getHome({} as Request, { render } as unknown as Response);

    expect(render).toHaveBeenCalledWith("index", {
      demoAuthEnabled: false,
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
    await controller.getHome({} as Request, { render } as unknown as Response);

    expect(render).toHaveBeenCalledWith("index", {
      demoAuthEnabled: false,
      jobRoles: [],
      errorMessage: expect.any(String),
    });
  });
});