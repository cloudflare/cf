/** @generated from zero-trust.access.targets.bulk.delete */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/batch_delete`,
	body: "json",
	response: false,
} as const;
