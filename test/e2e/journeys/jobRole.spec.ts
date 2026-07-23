import { expect, test } from "@playwright/test";

test.describe("Job role detail journey", () => {
	test("navigating to a role from the list shows the detail page", async ({
		page,
	}) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Software Engineer" }).click();
		await expect(page).toHaveURL("/job-roles/1");
		await expect(
			page.getByRole("heading", { name: "Software Engineer" }),
		).toBeVisible();
		await expect(page.getByText("Belfast")).toBeVisible();
		await expect(
			page.getByText("Build and maintain software services."),
		).toBeVisible();
	});

	test("breadcrumb links back to the job roles list", async ({ page }) => {
		await page.goto("/job-roles/1");
		await expect(page.getByRole("link", { name: "Job roles" })).toBeVisible();
	});

	test("detail page shows role metadata", async ({ page }) => {
		await page.goto("/job-roles/1");
		await expect(page.getByText("Engineering")).toBeVisible();
		await expect(page.getByText("Associate")).toBeVisible();
		await expect(page.getByText("Open Positions: 3")).toBeVisible();
	});
});
