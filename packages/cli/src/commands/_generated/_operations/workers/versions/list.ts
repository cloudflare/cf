/** @generated from listWorkerVersions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/workers/${request.worker_id}/versions`,
	query: ["page", "per_page"],
} as const;
