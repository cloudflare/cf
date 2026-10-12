/** @generated from zero-trust-gateway-pacfiles-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles/${request.pacfile_id}`,
} as const;
