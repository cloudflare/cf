/** @generated from pay-per-crawl.zones.query-can-be-enabled */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/zones_can_be_enabled/query`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
