/** @generated from cws-get-rego-metadata */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata/${request.rego_metadata_id}`,
} as const;
