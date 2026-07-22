import request from "supertest";
import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

process.env.API_BASE_URL = "http://localhost:4000";

let app: typeof import("../../src/app").default;

const SECRET = new TextEncoder().encode("test-secret-key");

describe("home branding integration", () => {
	let authToken: string;

	beforeAll(async () => {
		({ default: app } = await import("../../src/app"));

		authToken = await new SignJWT({
			email: "test@example.com",
			role: "user",
		})
			.setProtectedHeader({ alg: "HS256" })
			.setSubject("1")
			.sign(SECRET);
	});

	it("serves branded home markup at / when unauthenticated", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain('href="/register">Register</a>');
		expect(response.text).toContain('href="/login">Log in</a>');
	});

	it("serves branded home markup at / when authenticated", async () => {
		const response = await request(app)
			.get("/")
			.set("Cookie", [`access_token=${encodeURIComponent(authToken)}`]);

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/html");
		expect(response.text).toContain('class="kainos-header kainos-header--with-actions"');
		expect(response.text).toContain('src="/images/kainoslogo.png"');
		expect(response.text).toContain('href="/images/favicon.png"');
		expect(response.text).toContain('href="/styles/branding.css"');
		expect(response.text).toContain("Welcome back, test@example.com");
		expect(response.text).toContain('action="/logout"');
		expect(response.text).not.toContain('href="/login"');
		expect(response.text).toContain("Browse open roles");
	});

	it("serves branded login markup at /login", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/html");
		expect(response.text).toContain('src="/images/kainoslogo.png"');
		expect(response.text).toContain('href="/styles/branding.css"');
		expect(response.text).toContain("data-login-form");
		expect(response.text).toContain('method="post"');
		expect(response.text).toContain('action="/login"');
		expect(response.text).toContain('type="email"');
		expect(response.text).toContain('type="password"');
		expect(response.text).toContain("data-login-error");
		expect(response.text).toContain('href="/register">Register</a>');
		expect(response.text).not.toContain('href="/login">Log in</a>');
		expect(response.text).not.toContain("/scripts/auth.js");
	});

	it("serves required static branding assets", async () => {
		const cssResponse = await request(app).get("/styles/branding.css");
		expect(cssResponse.status).toBe(200);
		expect(cssResponse.headers["content-type"]).toContain("text/css");

		const scrollRevealResponse = await request(app).get(
			"/scripts/scroll-reveal.js",
		);
		expect(scrollRevealResponse.status).toBe(200);
		expect(scrollRevealResponse.headers["content-type"]).toContain(
			"javascript",
		);

		const logoResponse = await request(app).get("/images/kainoslogo.png");
		expect(logoResponse.status).toBe(200);
		expect(logoResponse.headers["content-type"]).toContain("image/png");

		const faviconResponse = await request(app).get("/images/favicon.png");
		expect(faviconResponse.status).toBe(200);
		expect(faviconResponse.headers["content-type"]).toContain("image/png");
	});
});
