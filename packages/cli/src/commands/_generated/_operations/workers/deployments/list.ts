/** @generated from worker-deployments-list-deployments */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/deployments`,
	query: ["since", "until", "page", "per_page"],
} as const;
