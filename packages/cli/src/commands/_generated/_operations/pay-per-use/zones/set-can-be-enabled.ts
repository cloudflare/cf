/** @generated from pay-per-crawl.setPPUZonesCanBeEnabled */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-use/zones_can_be_enabled`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
