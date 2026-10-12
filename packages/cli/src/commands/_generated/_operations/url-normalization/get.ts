/** @generated from getUrlNormalization */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/url_normalization`,
} as const;
