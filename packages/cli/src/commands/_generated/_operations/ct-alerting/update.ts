/** @generated from ct-alerting-update-subscription */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ct/alerting`,
	body: "json",
} as const;
