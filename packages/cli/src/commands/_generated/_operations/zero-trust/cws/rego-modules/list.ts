/** @generated from zero-trust.cws.rego-modules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-modules`,
	query: ["cursor", "per_page", "order", "direction", "name", "package_path"],
	joined: ["cursor", "per_page", "order", "direction", "name", "package_path"],
} as const;
