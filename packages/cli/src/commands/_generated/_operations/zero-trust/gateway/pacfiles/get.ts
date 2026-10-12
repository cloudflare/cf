/** @generated from zero-trust-gateway-pacfiles-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles/${request.pacfile_id}`,
} as const;
