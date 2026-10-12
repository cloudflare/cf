/** @generated from pay-per-crawl.getConfig */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-crawl/configuration`,
	errors: {
		400: "BadRequestError",
	},
} as const;
