/** @generated from api-security.expression-template.fallthrough.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/expression-template/fallthrough`,
	body: "json",
} as const;
