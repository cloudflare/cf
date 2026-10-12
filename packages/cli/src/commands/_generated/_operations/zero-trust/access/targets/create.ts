/** @generated from infra-targets-post */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets`,
	body: "json",
} as const;
