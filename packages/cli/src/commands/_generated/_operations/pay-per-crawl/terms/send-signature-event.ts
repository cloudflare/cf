/** @generated from pay-per-crawl.terms.send-signature-event */
export default {
	method: "POST",
	path: "/accounts/{account_id}/pay-per-crawl/terms/signature",
	query: ["event_type", "vid"],
	errors: {
		400: "BadRequestError",
	},
} as const;
