/** @generated from zero-trust.casb.policies.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/policies/${request.policy_id}`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
