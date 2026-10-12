/** @generated from zero-trust.gateway.pacfiles.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles/${request.pacfile_id}`,
} as const;
