/** @generated from zero-trust.casb.findings.unignore */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/findings/unignore`,
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
	},
} as const;
