/** @generated from pay-per-crawl.listCrawlers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/crawlers`,
	errors: {
		400: "BadRequestError",
	},
} as const;
