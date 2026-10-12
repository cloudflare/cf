/** @generated from logs.control.retention.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/control/retention/flag`,
	body: "json",
} as const;
