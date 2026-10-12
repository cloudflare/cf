/** @generated from getV4AccountsByAccount_idPipelines_deprecated */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines`,
	query: ["search", "page", "per_page"],
} as const;
