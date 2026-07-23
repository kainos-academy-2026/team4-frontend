import { expect, test } from "@playwright/test";

const DEMO_EMAIL = "demo@kainos.com";
const DEMO_PASSWORD = "Demo@1234!";

// Minimal PDF header so the browser MIME-type check passes
const fakePdf = (label: string) =>
	Buffer.from(`%PDF-1.4 ${label} fake content`);

/** Navigate home then smooth-scroll to the roles table for a polished demo. */
async function goHomeAndScrollToRoles(page: import("@playwright/test").Page) {
	await page.goto("/");
	await page.evaluate(() =>
		document
			.getElementById("roles")
			?.scrollIntoView({ behavior: "smooth", block: "start" }),
	);
	await page.waitForTimeout(1200);
}

test("full demo journey", async ({ page }) => {
	test.setTimeout(120_000);

	// Intercept the mock S3 presigned-URL PUT from the browser (avoids CORS)
	await page.route("http://localhost:4000/upload/**", (route) => {
		void route.fulfill({ status: 200 });
	});
	// ── 1. Failed login ──────────────────────────────────────────────────────
	await page.goto("/login");
	await page.getByLabel("Email").fill("wrong@example.com");
	await page.getByLabel("Password").fill("wrongpassword");
	await page.getByRole("button", { name: "Log in" }).click();
	await expect(page.getByText("Invalid email or password.")).toBeVisible();

	// ── 2. Navigate to Register ───────────────────────────────────────────────
	await page.getByRole("link", { name: "Register" }).first().click();
	await expect(page).toHaveURL("/register");

	// ── 3. Invalid email format ───────────────────────────────────────────────
	await page.getByLabel("Email").fill("notanemail");
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(
		page.getByText("Please enter a valid email address."),
	).toBeVisible();

	// ── 4. Valid email but weak password ─────────────────────────────────────
	await page.getByLabel("Email").fill(DEMO_EMAIL);
	await page.locator("[data-register-password]").fill("password123");
	// Uppercase and special character requirements should not be met
	await expect(
		page.locator('[data-requirement="uppercase"]'),
	).not.toHaveClass(/is-met/);
	await expect(
		page.locator('[data-requirement="special"]'),
	).not.toHaveClass(/is-met/);

	// ── 5. Correct registration ───────────────────────────────────────────────
	await page.locator("[data-register-password]").fill(DEMO_PASSWORD);
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page.getByText("Registration Successful")).toBeVisible();
	await page.waitForURL("/login");

	// ── 6. Correct login ─────────────────────────────────────────────────────
	await page.getByLabel("Email").fill(DEMO_EMAIL);
	await page.getByLabel("Password").fill(DEMO_PASSWORD);
	await page.getByRole("button", { name: "Log in" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByText(DEMO_EMAIL)).toBeVisible();

	// ── 7. Open job role detail ───────────────────────────────────────────────
	await page.getByRole("link", { name: "Software Engineer" }).click();
	await expect(page).toHaveURL("/job-roles/1");
	await expect(
		page.getByRole("heading", { name: "Software Engineer" }),
	).toBeVisible();

	// ── 8. Navigate to apply page ────────────────────────────────────────────
	await page.getByRole("link", { name: "Apply now" }).click();
	await expect(page).toHaveURL("/job-roles/1/apply");

	// ── 9. Submit CV ─────────────────────────────────────────────────────────
	await page.locator("[data-cv-file-input]").setInputFiles({
		name: "my-cv.pdf",
		mimeType: "application/pdf",
		buffer: fakePdf("original"),
	});
	await page.getByRole("button", { name: "Submit application" }).click();
	await expect(page.getByText("Application submitted")).toBeVisible();

	// ── 10. Return to home and scroll to roles ──────────────────────────────
	await goHomeAndScrollToRoles(page);
	await expect(
		page.getByRole("heading", { name: "Open Job Roles at Kainos" }),
	).toBeVisible();

	// ── 11. Back to apply — existing application shown ────────────────────────
	await page.getByRole("link", { name: "Software Engineer" }).click();
	await page.getByRole("link", { name: "Apply now" }).click();
	await expect(
		page.getByText("You have an active application"),
	).toBeVisible();

	// ── 12. Change CV ────────────────────────────────────────────────────────
	await page.locator("[data-cv-file-input]").setInputFiles({
		name: "my-cv-updated.pdf",
		mimeType: "application/pdf",
		buffer: fakePdf("updated"),
	});
	await page.getByRole("button", { name: "Submit application" }).click();
	await expect(page.getByText("CV Updated")).toBeVisible();

	// ── 13. Return home and log out ───────────────────────────────────────────
	await goHomeAndScrollToRoles(page);
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
	await page.waitForTimeout(800);
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});
