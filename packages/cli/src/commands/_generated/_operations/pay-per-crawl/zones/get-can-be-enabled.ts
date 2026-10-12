/** @generated from pay-per-crawl.zones.get-can-be-enabled */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-crawl/can_be_enabled`,
	errors: {
		400: "BadRequestError",
	},
} as const;
