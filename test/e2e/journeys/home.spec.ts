import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
	test("shows the job roles table with open roles", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("table")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Software Engineer" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Product Manager" }),
		).toBeVisible();
	});

	test("unauthenticated user sees a login prompt", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByText("You must be logged in to apply for a role."),
		).toBeVisible();
	});

	test("unauthenticated user sees Log in and Register in the header", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
	});
});
