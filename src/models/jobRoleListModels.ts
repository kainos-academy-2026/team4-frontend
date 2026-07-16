export type JobRoleListItem = {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: Date;
	status: string;
	myApplication?: {
		status?: string;
		cvFileName?: string;
	} | null;
};

export type JobRoleListPage = {
	errorMessage: string | null;
	jobRoles: JobRoleListItem[];
};
