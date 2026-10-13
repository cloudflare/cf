/** @generated from zero-trust.access.targets.bulk.replace-tags */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets/batch_tags`,
	body: "json",
} as const;
