/** @generated from pay-per-crawl.patchConfig */
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
