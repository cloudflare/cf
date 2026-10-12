/** @generated from updateUrlNormalization */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/url_normalization`,
	body: "json",
} as const;
