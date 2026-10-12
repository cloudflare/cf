/** @generated from ct-alerting-get-subscription */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ct/alerting`,
} as const;
