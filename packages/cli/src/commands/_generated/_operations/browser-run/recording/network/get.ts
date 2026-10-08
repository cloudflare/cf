/** @generated from browser-run.recording.network.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/browser-rendering/recording/{session_id}/network",
	query: ["format", "target"],
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
