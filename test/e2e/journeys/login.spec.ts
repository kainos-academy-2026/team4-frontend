import { expect, test } from "@playwright/test";

test.describe("Login journey", () => {
	test("login page renders correctly", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
		await expect(page.getByLabel("Email")).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Log in" }),
		).toBeVisible();
	});

	test("shows error on invalid credentials", async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Email").fill("wrong@example.com");
		await page.getByLabel("Password").fill("wrongpassword");
		await page.getByRole("button", { name: "Log in" }).click();
		await expect(page.getByText("Invalid email or password.")).toBeVisible();
	});

	test("successful login redirects to home and shows the user email", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.getByLabel("Email").fill("test@kainos.com");
		await page.getByLabel("Password").fill("Password1!");
		await page.getByRole("button", { name: "Log in" }).click();
		await expect(page).toHaveURL("/");
		await expect(page.getByText("test@kainos.com")).toBeVisible();
	});
});
