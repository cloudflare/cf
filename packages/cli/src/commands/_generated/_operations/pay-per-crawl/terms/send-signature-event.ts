/** @generated from pay-per-crawl.terms.send-signature-event */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/terms/signature`,
	query: ["event_type", "vid"],
	errors: {
		400: "BadRequestError",
	},
} as const;
