import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app";

describe("home branding integration", () => {
  it("serves branded home markup at /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("class=\"kainos-header\"");
    expect(response.text).toContain("src=\"/images/kainoslogo.png\"");
    expect(response.text).toContain("href=\"/images/favicon.png\"");
    expect(response.text).toContain("href=\"/styles/branding.css\"");
    expect(response.text).toContain("careers@kainosjobs.example");
    expect(response.text).toContain("+44 28 9000 0000");
  });

  it("serves required static branding assets", async () => {
    const cssResponse = await request(app).get("/styles/branding.css");
    expect(cssResponse.status).toBe(200);
    expect(cssResponse.headers["content-type"]).toContain("text/css");

    const logoResponse = await request(app).get("/images/kainoslogo.png");
    expect(logoResponse.status).toBe(200);
    expect(logoResponse.headers["content-type"]).toContain("image/png");

    const faviconResponse = await request(app).get("/images/favicon.png");
    expect(faviconResponse.status).toBe(200);
    expect(faviconResponse.headers["content-type"]).toContain("image/png");
  });
});