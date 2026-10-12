/** @generated from workers.previews.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/workers/${request.worker_id}/previews/${request.preview_id}`,
	query: ["force"],
} as const;
