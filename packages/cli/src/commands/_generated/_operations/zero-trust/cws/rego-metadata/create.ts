/** @generated from cws-create-rego-metadata */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata`,
	body: "json",
} as const;
