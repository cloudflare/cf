/** @generated from listBuildsByPreview */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_tag}/previews/${request.preview_id}/builds`,
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
