/** @generated from pay-per-crawl.getPPUZoneCanBeEnabled */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-use/can_be_enabled`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
