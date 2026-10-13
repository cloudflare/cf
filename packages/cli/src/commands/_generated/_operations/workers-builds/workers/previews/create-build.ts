/** @generated from workers-builds.workers.previews.create-build */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_tag}/previews/${request.preview_id}/builds`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
