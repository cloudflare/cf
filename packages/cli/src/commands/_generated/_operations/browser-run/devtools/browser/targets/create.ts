/** @generated from browser-run.devtools.browser.targets.create */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser/{session_id}/json/new",
	query: ["url", "liveViewUrlExpiresInMs"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
