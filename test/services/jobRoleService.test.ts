import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";
import axios, { AxiosError } from "axios";

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

  it("rethrows non-404 errors when listing roles", async () => {
    const requestError = {
      isAxiosError: true,
      response: { status: 500 },
      message: "Server error",
    };
    const mockGet = vi.fn().mockRejectedValue(requestError);
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getOpenRoles()).rejects.toBe(requestError);
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

  it("returns fallback job role detail by id when fallback mode is enabled", async () => {
    const service = new JobRoleService(
      { get: vi.fn() } as unknown as AxiosInstance,
      fallbackData,
      true,
    );

    await expect(service.getRoleById(3)).resolves.toEqual(fallbackData[0]);
    await expect(service.getRoleById(999)).resolves.toBeNull();
  });

  it("returns null when backend detail endpoint responds with 404", async () => {
    const mockGet = vi.fn().mockRejectedValue(
      new AxiosError("Not Found", "404", undefined, undefined, {
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {
          headers: axios.AxiosHeaders.from({}),
        },
        data: {},
      }),
    );

    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getRoleById(999)).resolves.toBeNull();
  });

  it("rethrows non-404 errors when listing job roles", async () => {
    const serviceError = new Error("Service unavailable");
    const mockGet = vi.fn().mockRejectedValue(serviceError);

    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getOpenRoles()).rejects.toThrow("Service unavailable");
  });

  it("rethrows non-404 errors when fetching job role detail", async () => {
    const serviceError = new Error("Gateway timeout");
    const mockGet = vi.fn().mockRejectedValue(serviceError);

    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getRoleById(5)).rejects.toThrow("Gateway timeout");
  });

  it("returns null when detail endpoint responds with 404", async () => {
    const mockGet = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getRoleById(999)).resolves.toBeNull();
  });

  it("rethrows non-404 errors when loading role details", async () => {
    const requestError = {
      isAxiosError: true,
      response: { status: 500 },
      message: "Server error",
    };
    const mockGet = vi.fn().mockRejectedValue(requestError);
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      false,
    );

    await expect(service.getRoleById(1)).rejects.toBe(requestError);
  });

  it("returns fallback role details by id when fallback mode is enabled", async () => {
    const mockGet = vi.fn();
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
      fallbackData,
      true,
    );

    await expect(service.getRoleById(3)).resolves.toEqual(fallbackData[0]);
    await expect(service.getRoleById(404)).resolves.toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });
});