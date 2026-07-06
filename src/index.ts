import app from "./app";

 const portFromEnv = Number(process.env.PORT);
 const port = Number.isFinite(portFromEnv) ? portFromEnv : 3000;

app.listen(port, () => {
  // Keep startup logging minimal for local/dev verification.
  console.log(`Server listening on http://localhost:${port}`);
});
