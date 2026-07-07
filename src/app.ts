import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";
import nunjucks from "nunjucks";

import router from "./routes";

const app: Express = express();
const viewsPath = path.join(__dirname, "views");
const distPublicPath = path.join(__dirname, "public");
const sourcePublicPath = path.join(__dirname, "..", "public");
const publicPath = fs.existsSync(distPublicPath)
	? distPublicPath
	: sourcePublicPath;

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
	noCache: process.env.NODE_ENV !== "production",
});

app.set("view engine", "njk");
app.set("views", viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.use(router);

export default app;
