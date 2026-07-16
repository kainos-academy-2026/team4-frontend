import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";
import axios, { AxiosError } from "axios";

import type {
  JobRoleDetailApi,
  JobRoleListApi,
} from "../../src/mappers/jobRoleMapper";
import { JobRoleService } from "../../src/services/jobRoleService";

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
  myApplication: null,
};

describe("JobRoleService", () => {
  it("returns only open job roles from API response", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: listApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
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
        myApplication: null,
      },
    ]);
  });

<<<<<<< HEAD
=======
  it("forwards auth header when listing open roles", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: listApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
    );

    await service.getOpenRoles("Bearer token");

    expect(mockGet).toHaveBeenCalledWith("/job-roles", {
      headers: { Authorization: "Bearer token" },
    });
  });

>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
  it("returns an empty list when backend responds with 404", async () => {
    const mockGet = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
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
    );

    await expect(service.getOpenRoles()).rejects.toBe(requestError);
  });

  it("returns full job role details from API by id", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: detailApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
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
      myApplication: null,
    });
  });

<<<<<<< HEAD
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

=======
  it("forwards auth header when loading role details", async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: detailApiData });
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
    );

    await service.getRoleById(1, "Bearer token");

    expect(mockGet).toHaveBeenCalledWith("/job-roles/1", {
      headers: { Authorization: "Bearer token" },
    });
  });

  it("returns null when detail endpoint responds with 404", async () => {
    const mockGet = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
    );

    await expect(service.getRoleById(999)).resolves.toBeNull();
  });

<<<<<<< HEAD
  it("rethrows non-404 errors when listing job roles", async () => {
    const serviceError = new Error("Service unavailable");
    const mockGet = vi.fn().mockRejectedValue(serviceError);

=======
  it("rethrows non-404 errors when loading role details", async () => {
    const requestError = {
      isAxiosError: true,
      response: { status: 500 },
      message: "Server error",
    };
    const mockGet = vi.fn().mockRejectedValue(requestError);
>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
    );

<<<<<<< HEAD
    await expect(service.getOpenRoles()).rejects.toThrow("Service unavailable");
  });

  it("rethrows non-404 errors when fetching job role detail", async () => {
    const serviceError = new Error("Gateway timeout");
    const mockGet = vi.fn().mockRejectedValue(serviceError);

    const service = new JobRoleService(
      { get: mockGet } as unknown as AxiosInstance,
    );

    await expect(service.getRoleById(5)).rejects.toThrow("Gateway timeout");
  });
=======
    await expect(service.getRoleById(1)).rejects.toBe(requestError);
  });

>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
});