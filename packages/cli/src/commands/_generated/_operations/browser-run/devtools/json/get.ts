/** @generated from browser-run.devtools.json.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser/{session_id}/json",
	query: ["liveViewUrlExpiresInMs"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
