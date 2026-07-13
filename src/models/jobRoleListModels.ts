export type JobRoleListItem = {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: Date;
	status: string;
};

export type JobRoleListPage = {
	errorMessage: string | null;
	jobRoles: JobRoleListItem[];
};