/** @generated from zero-trust.casb.findings.instances.export */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/findings/${request.storage_namespace_id}/instances/export`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
