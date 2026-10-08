/** @generated from browser-run.devtools.browser.targets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser/{session_id}/json/list",
	query: ["liveViewUrlExpiresInMs"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
