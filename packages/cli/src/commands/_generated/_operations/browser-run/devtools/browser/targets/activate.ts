/** @generated from browser-run.devtools.browser.targets.activate */
export default {
	method: "GET",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser/{session_id}/json/activate/{target_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
