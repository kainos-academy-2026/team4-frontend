const DEFAULT_FRONTEND_PORT = "3000";
const DEFAULT_BACKEND_PORT = "3000";
const ALTERNATE_BACKEND_PORT = "4000";

const getDefaultApiBaseUrl = (env: NodeJS.ProcessEnv): string => {
	const frontendPort = env.PORT ?? DEFAULT_FRONTEND_PORT;
	const backendPort =
		frontendPort === DEFAULT_BACKEND_PORT
			? ALTERNATE_BACKEND_PORT
			: DEFAULT_BACKEND_PORT;

	return `http://localhost:${backendPort}`;
};

export const getApiBaseUrl = (env: NodeJS.ProcessEnv = process.env): string => {
	return env.API_BASE_URL ?? getDefaultApiBaseUrl(env);
};
