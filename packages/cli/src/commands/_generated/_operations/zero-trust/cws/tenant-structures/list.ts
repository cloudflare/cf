/** @generated from cws-list-tenant-structures */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures`,
	query: ["cursor", "per_page", "order", "direction", "name", "import_path"],
	joined: ["cursor", "per_page", "order", "direction", "name", "import_path"],
} as const;
