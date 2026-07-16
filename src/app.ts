import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import nunjucks from "nunjucks";
import { setAuthContext } from "./middleware/authContext";
import router from "./routes";

// Validate required environment variables at startup
if (!process.env.API_BASE_URL) {
	throw new Error("API_BASE_URL environment variable is required");
}

const app: Express = express();
const viewsPath = path.join(__dirname, "views");
const distPublicPath = path.join(__dirname, "..", "dist", "public");
const sourcePublicPath = path.join(__dirname, "..", "public");

export const resolvePublicPath = (
	distPath: string,
	sourcePath: string,
	fsModule: Pick<typeof fs, "existsSync"> = fs,
): string => {
	const distBrandingCssPath = path.join(distPath, "styles", "branding.css");
	return fsModule.existsSync(distBrandingCssPath) ? distPath : sourcePath;
};

const publicPath = resolvePublicPath(distPublicPath, sourcePublicPath);

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
	noCache: process.env.NODE_ENV !== "production",
});

app.set("view engine", "njk");
app.set("views", viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieParser());
app.use(express.static(publicPath));

app.use(router);

export default app;
