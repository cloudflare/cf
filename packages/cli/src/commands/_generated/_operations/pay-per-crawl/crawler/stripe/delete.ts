/** @generated from pay-per-crawl.crawlerDeleteStripeConfig */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/crawler/stripe`,
	errors: {
		400: "BadRequestError",
	},
} as const;
