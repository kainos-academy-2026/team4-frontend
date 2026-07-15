import "dotenv/config";
import app from "./app";

const serverPort = Number(process.env.PORT) || 3000;

app.listen(serverPort, () => {
	// Keep startup logging minimal for local/dev verification.
	console.log(`Server listening on http://localhost:${serverPort}`);
});
