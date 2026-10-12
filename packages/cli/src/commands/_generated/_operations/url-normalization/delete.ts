/** @generated from url-normalization.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/url_normalization`,
	response: false,
} as const;
