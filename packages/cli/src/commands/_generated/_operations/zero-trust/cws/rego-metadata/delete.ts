/** @generated from zero-trust.cws.rego-metadata.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata/${request.rego_metadata_id}`,
} as const;
