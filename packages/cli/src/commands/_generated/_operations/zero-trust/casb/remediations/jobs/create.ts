/** @generated from CreateRemediationJobs */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/remediations/jobs`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
