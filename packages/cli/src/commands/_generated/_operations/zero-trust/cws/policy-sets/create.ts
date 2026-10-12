/** @generated from cws-create-policy-set */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policy-sets`,
	body: "json",
} as const;
