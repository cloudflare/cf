/** @generated from spectrum-applications-list-spectrum-applications */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps`,
	query: ["page", "per_page", "direction", "order"],
} as const;
