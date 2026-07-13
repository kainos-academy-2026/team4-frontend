import { Router } from "express";

const notFoundRouter = Router();

notFoundRouter.get("/404", (_request, response) => {
	response.render("not-found", {
		title: "Page not found",
		message: "The page you requested does not exist.",
	});
});

export default notFoundRouter;
