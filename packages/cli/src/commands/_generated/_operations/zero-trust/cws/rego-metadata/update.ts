/** @generated from zero-trust.cws.rego-metadata.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata/${request.rego_metadata_id}`,
	body: "json",
} as const;
