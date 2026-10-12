/** @generated from cws-update-rego-metadata */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata/${request.rego_metadata_id}`,
	body: "json",
} as const;
