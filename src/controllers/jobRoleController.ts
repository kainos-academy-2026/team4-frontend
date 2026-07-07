import type { Request, Response } from "express";

import { JobRoleService, JobRoleServiceError } from "../services/jobRoleService";

type JobRoleListViewModel = {
  errorMessage: string | null;
  jobRoles: Array<{
    roleName: string;
    location: string;
    capability: string;
    band: string;
    closingDate: string;
    status: string;
  }>;
};

export class JobRoleController {
  constructor(private readonly jobRoleService: JobRoleService = new JobRoleService()) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await this.jobRoleService.getOpenJobRoles();

      const viewModel: JobRoleListViewModel = {
        errorMessage: null,
        jobRoles: jobRoles.map((jobRole) => ({
          roleName: jobRole.roleName,
          location: jobRole.location,
          capability: jobRole.capability,
          band: jobRole.band,
          closingDate: jobRole.closingDate,
          status: jobRole.status,
        })),
      };

      res.render("job-role-list", viewModel);
    } catch (error) {
      const errorMessage =
        error instanceof JobRoleServiceError
          ? error.message
          : "Unable to load job roles at the moment.";

      res.status(502).render("job-role-list", {
        errorMessage,
        jobRoles: [],
      } satisfies JobRoleListViewModel);
    }
  }
}