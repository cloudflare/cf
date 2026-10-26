/** @generated from precursor.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/precursor`,
	headers: ["Cloudflare-Version"],
} as const;
