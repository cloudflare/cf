/** @generated from pay-per-crawl.getPPUZoneConfiguration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-use/configuration`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
