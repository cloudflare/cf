/** @generated from ListExportJobs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/exports`,
	query: ["page", "per_page", "status"],
	errors: {
		400: "BadRequestError",
	},
} as const;
