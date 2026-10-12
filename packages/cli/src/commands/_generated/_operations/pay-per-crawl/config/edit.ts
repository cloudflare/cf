/** @generated from pay-per-crawl.config.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-crawl/configuration`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
