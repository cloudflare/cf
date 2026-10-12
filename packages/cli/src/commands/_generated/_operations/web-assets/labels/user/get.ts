/** @generated from web-assets.labels.user.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user/${request.name}`,
	query: ["with_mapped_resource_counts"],
} as const;
