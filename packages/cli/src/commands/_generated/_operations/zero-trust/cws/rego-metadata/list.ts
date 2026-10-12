/** @generated from zero-trust.cws.rego-metadata.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-metadata`,
	query: ["cursor", "per_page", "order", "direction", "name", "import_path"],
	joined: ["cursor", "per_page", "order", "direction", "name", "import_path"],
} as const;
