export type JobRoleListItemViewModel = {
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: string;
};

export type JobRoleListViewModel = {
	errorMessage: string | null;
	jobRoles: JobRoleListItemViewModel[];
};