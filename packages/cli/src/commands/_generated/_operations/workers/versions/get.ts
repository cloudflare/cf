/** @generated from workers.versions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/workers/${request.worker_id}/versions/${request.version_id}`,
	query: ["include"],
} as const;
