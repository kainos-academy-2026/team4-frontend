import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";

import type {
  JobRoleDetailApi,
  JobRoleListApi,
} from "../../src/mappers/jobRoleMapper";
import { JobRoleService } from "../../src/services/jobRoleService";
import type { JobRole } from "../../src/models/jobRole";

const listApiData: JobRoleListApi[] = [
  {
    id: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityName: "Engineering",
    bandName: "Associate",
    closingDate: "2026-08-01",
    status: "open",
  },
  {
    id: 2,
    roleName: "Data Analyst",
    location: "Gdansk",
    capabilityName: "Data",
    bandName: "Associate",
    closingDate: "2026-08-08",
    status: "closed",
  },
];

const detailApiData: JobRoleDetailApi = {
  id: 1,
  roleName: "Software Engineer",
  location: "Belfast",
  capabilityName: "Engineering",
  capabilityId: 1,
  bandName: "Associate",
  bandId: 1,
  closingDate: new Date("2026-08-01"),
  status: "open",
  description: "Build services",
  responsibilities: "Ship features",
  sharepointUrl: "https://example.com/role/1",
  numberOfOpenPositions: 2,
};

const fallbackData: JobRole[] = [
  {
    id: 3,
    roleName: "Test Engineer",
    location: "Dublin",
    capability: "Quality Engineering",
    band: "Senior Associate",
    closingDate: new Date("2026-08-12"),
    status: "open",
    description: "Test releases",
    responsibilities: "Own QA",
    sharepointUrl: "https://example.com/role/3",
    numberOfOpenPositions: 1,
  },
];

describe("JobRoleService", () => {
  it("returns only open job roles from API response", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: listApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    const result = await service.getOpenRoles();

    expect(mockGet).toHaveBeenCalledWith("/job-roles");
    expect(result).toEqual([
      {
        id: 1,
        roleName: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Associate",
        closingDate: new Date("2026-08-01"),
        status: "open",
      },
    ]);
  });

  it("returns fallback open roles when fallback mode is enabled", async () => {
    const mockGet = vi.fn();
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      true,
    );

    const result = await service.getOpenRoles();

    expect(mockGet).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 3,
        roleName: "Test Engineer",
        location: "Dublin",
        capability: "Quality Engineering",
        band: "Senior Associate",
        closingDate: new Date("2026-08-12"),
        status: "open",
      },
    ]);
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

    await expect(service.getOpenRoles()).resolves.toEqual([]);
  });

  it("returns full job role details from API by id", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: detailApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    const result = await service.getRoleById(1);

    expect(mockGet).toHaveBeenCalledWith("/job-roles/1");
    expect(result).toEqual({
      id: 1,
      roleName: "Software Engineer",
      location: "Belfast",
      capability: "Engineering",
      band: "Associate",
      closingDate: new Date("2026-08-01"),
      status: "open",
      description: "Build services",
      responsibilities: "Ship features",
      sharepointUrl: "https://example.com/role/1",
      numberOfOpenPositions: 2,
    });
  });
});