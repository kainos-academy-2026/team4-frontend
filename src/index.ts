import app from "./app";

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // Keep startup logging minimal for local/dev verification.
  console.log(`Server listening on http://localhost:${port}`);
});
