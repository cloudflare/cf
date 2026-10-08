/** @generated from browser-run.devtools.browser.live-view.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser/{session_id}/live_view",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
