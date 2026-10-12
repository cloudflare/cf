/** @generated from infra-targets-put-batch */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/batch`,
	body: "json",
} as const;
