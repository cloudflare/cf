/** @generated from zero-trust.gateway.pacfiles.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles/${request.pacfile_id}`,
	body: "json",
} as const;
