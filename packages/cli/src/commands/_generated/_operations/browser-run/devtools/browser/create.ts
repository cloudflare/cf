/** @generated from browser-run.devtools.browser.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/browser-rendering/devtools/browser",
	query: [
		"keep_alive",
		"lab",
		"targets",
		"liveViewUrlExpiresInMs",
		"recording",
	],
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
