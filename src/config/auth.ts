export const isDemoAuthEnabled = (
	env: NodeJS.ProcessEnv = process.env,
): boolean => env.ENABLE_DEMO_AUTH === "true";
