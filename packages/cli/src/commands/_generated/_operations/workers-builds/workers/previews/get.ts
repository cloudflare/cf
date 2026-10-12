/** @generated from workers-builds.workers.previews.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_tag}/previews/${request.preview_id}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
