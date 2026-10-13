/** @generated from builds.deploy-hooks.trigger */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/workers/builds/deploy_hooks/${request.deploy_hook_uuid}`,
	errors: {
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
