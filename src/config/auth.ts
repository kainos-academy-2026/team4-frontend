export const DEMO_AUTH_FEATURE_FLAG = "ENABLE_DEMO_AUTH";

export const isDemoAuthEnabled = (
	env: NodeJS.ProcessEnv = process.env,
): boolean => env[DEMO_AUTH_FEATURE_FLAG] === "true";
