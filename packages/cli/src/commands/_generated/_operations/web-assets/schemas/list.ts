/** @generated from web-assets.schemas.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/schemas`,
	query: ["host", "feature", "include_schema_kind"],
} as const;
