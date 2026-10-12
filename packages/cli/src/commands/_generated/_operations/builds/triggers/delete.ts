/** @generated from builds.triggers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
