/** @generated from logs.control.retention.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/control/retention/flag`,
} as const;
