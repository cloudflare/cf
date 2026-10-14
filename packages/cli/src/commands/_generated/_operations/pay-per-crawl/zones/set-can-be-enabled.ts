/** @generated from pay-per-crawl.zones.set-can-be-enabled */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/zones_can_be_enabled`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
