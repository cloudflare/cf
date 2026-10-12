/** @generated from postV4AccountsByAccount_idPipelines_deprecated */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines`,
	body: "json",
} as const;
