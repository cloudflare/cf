/** @generated from deleteWorkerVersion */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/workers/${request.worker_id}/versions/${request.version_id}`,
} as const;
