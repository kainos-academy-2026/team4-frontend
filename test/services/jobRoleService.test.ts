import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";

import type { JobRoleApiResponse } from "../../src/mappers/jobRoleMapper";
import { JobRoleService } from "../../src/services/jobRoleService";
import type { JobRole } from "../../src/models/jobRole";

const apiData: JobRoleApiResponse[] = [
  {
    id: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityName: "Engineering",
    capabilityId: 1,
    bandName: "Associate",
    bandId: 1,
    closingDate: "2026-08-01",
    status: "open",
  },
  {
    id: 2,
    roleName: "Data Analyst",
    location: "Gdansk",
    capabilityName: "Data",
    capabilityId: 2,
    bandName: "Associate",
    bandId: 2,
    closingDate: "2026-08-08",
    status: "closed",
  },
];

const fallbackData: JobRole[] = [
  {
    id: "3",
    roleName: "Test Engineer",
    location: "Dublin",
    capability: "Quality Engineering",
    band: "Senior Associate",
    closingDate: new Date("2026-08-12"),
    status: "open",
  },
];

describe("JobRoleService", () => {
  it("returns only open job roles from API response", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: apiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    const result = await service.getOpenJobRoles("test-token");

    expect(mockGet).toHaveBeenCalledWith("/job-roles", {
      headers: {
        Authorization: "Bearer test-token",
      },
    });
    expect(result).toEqual([
      {
        id: "1",
        roleName: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Associate",
        closingDate: new Date("2026-08-01"),
        status: "open",
      },
    ]);
  });

  it("returns fallback open roles when backend request fails and fallback is enabled", async () => {
    const mockGet = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 503 },
    });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      true,
    );

    const result = await service.getOpenJobRoles("test-token");

    expect(result).toEqual(fallbackData);
  });

  it("returns an empty list when backend responds with 404", async () => {
    const mockGet = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getOpenJobRoles("test-token")).resolves.toEqual([]);
  });
});