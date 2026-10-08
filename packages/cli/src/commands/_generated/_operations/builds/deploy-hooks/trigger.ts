/** @generated from builds.deploy-hooks.trigger */
export default {
	method: "POST",
	path: "/workers/builds/deploy_hooks/{deploy_hook_uuid}",
	errors: {
		404: "NotFoundError",
		429: "TooManyRequestsError",
	},
} as const;
