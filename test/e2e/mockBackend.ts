import express from "express";
import { SignJWT } from "jose";

const app = express();
// Raw parser for mock S3 PUT must be registered before json middleware
app.use("/upload", express.raw({ type: "*/*", limit: "50mb" }));
app.use(express.json());

const MOCK_SECRET = new TextEncoder().encode("mock-e2e-secret");

// In-memory state for demo journey
const registeredUsers: Array<{ email: string; password: string }> = [];
const applications: Record<number, { cvFileName: string; s3Key: string }> = {};

const jobRoles = [
	{
		id: 1,
		roleName: "Software Engineer",
		location: "Belfast",
		capabilityName: "Engineering",
		bandName: "Associate",
		closingDate: "2026-12-31",
		status: "open",
		myApplication: null,
	},
	{
		id: 2,
		roleName: "Product Manager",
		location: "London",
		capabilityName: "Product",
		bandName: "Senior Associate",
		closingDate: "2026-11-30",
		status: "open",
		myApplication: null,
	},
	{
		id: 3,
		roleName: "UX Designer",
		location: "Belfast",
		capabilityName: "Design",
		bandName: "Associate",
		closingDate: "2026-10-15",
		status: "open",
		myApplication: null,
	},
	{
		id: 4,
		roleName: "Data Analyst",
		location: "Birmingham",
		capabilityName: "Data",
		bandName: "Senior Associate",
		closingDate: "2026-09-30",
		status: "open",
		myApplication: null,
	},
	{
		id: 5,
		roleName: "DevOps Engineer",
		location: "Remote",
		capabilityName: "Engineering",
		bandName: "Senior Associate",
		closingDate: "2026-11-01",
		status: "open",
		myApplication: null,
	},
	{
		id: 6,
		roleName: "Delivery Manager",
		location: "London",
		capabilityName: "Delivery",
		bandName: "Manager",
		closingDate: "2026-10-31",
		status: "open",
		myApplication: null,
	},
	{
		id: 7,
		roleName: "Business Analyst",
		location: "Belfast",
		capabilityName: "Consulting",
		bandName: "Associate",
		closingDate: "2026-12-15",
		status: "open",
		myApplication: null,
	},
	{
		id: 8,
		roleName: "Cloud Architect",
		location: "Remote",
		capabilityName: "Engineering",
		bandName: "Principal",
		closingDate: "2027-01-31",
		status: "open",
		myApplication: null,
	},
];

const jobRoleDetail = {
	id: 1,
	roleName: "Software Engineer",
	location: "Belfast",
	capabilityName: "Engineering",
	capabilityId: 1,
	bandName: "Associate",
	bandId: 1,
	closingDate: "2026-12-31",
	status: "open",
	description: "Build and maintain software services.",
	responsibilities: "Ship features, write tests, and review code.",
	sharepointUrl: "https://example.com/role/1",
	numberOfOpenPositions: 3,
	myApplication: null,
};

app.get("/job-roles", (_req, res) => {
	const rolesWithApplications = jobRoles.map((role) => ({
		...role,
		myApplication: applications[role.id]
			? { status: "Applied", cvFileName: applications[role.id].cvFileName }
			: null,
	}));
	res.json(rolesWithApplications);
});

app.get("/job-roles/:id", (req, res) => {
	if (Number(req.params.id) === 1) {
		const application = applications[1];
		res.json({
			...jobRoleDetail,
			myApplication: application
				? { status: "Applied", cvFileName: application.cvFileName }
				: null,
		});
	} else {
		res.status(404).json({ message: "Role not found" });
	}
});

app.post("/auth/register", (req, res) => {
	const { email, password } = req.body as { email: string; password: string };
	if (!email || !password) {
		res.status(400).json({ message: "Missing email or password" });
		return;
	}
	const existing = registeredUsers.find((u) => u.email === email);
	if (existing) {
		// Idempotent for demo re-runs: update password
		existing.password = password;
	} else {
		registeredUsers.push({ email, password });
	}
	res.status(201).json({ id: String(registeredUsers.length), email, role: "User" });
});

app.post("/auth/login", async (req, res) => {
	const { email, password } = req.body as { email: string; password: string };

	const isDefaultUser = email === "test@kainos.com" && password === "Password1!";
	const isRegisteredUser = registeredUsers.some(
		(u) => u.email === email && u.password === password,
	);

	if (isDefaultUser || isRegisteredUser) {
		const accessToken = await new SignJWT({ email, role: "user" })
			.setProtectedHeader({ alg: "HS256" })
			.setSubject("1")
			.sign(MOCK_SECRET);
		res.json({ accessToken });
	} else {
		res.status(401).json({ message: "Invalid email or password." });
	}
});

app.get("/job-roles/:id/applications/upload-url", (req, res) => {
	const fileName = String(req.query.fileName ?? "cv");
	const s3Key = `${Date.now()}-${fileName}`;
	res.json({
		presignedUrl: `http://localhost:4000/upload/${s3Key}`,
		s3Key,
	});
});

// Mock S3: accept any PUT to /upload/:key
app.put("/upload/:key", (_req, res) => {
	res.status(200).send();
});

app.post("/job-roles/:id/applications", (req, res) => {
	const id = Number(req.params.id);
	const { cvFileName, s3Key } = req.body as { cvFileName: string; s3Key: string };
	applications[id] = { cvFileName, s3Key };
	res.status(201).json({ message: "Application submitted successfully" });
});

app.listen(4000, () => {
	console.log("Mock backend listening on http://localhost:4000");
});
