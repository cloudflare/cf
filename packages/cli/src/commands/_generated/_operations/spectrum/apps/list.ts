/** @generated from spectrum.apps.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps`,
	query: ["page", "per_page", "direction", "order"],
} as const;
