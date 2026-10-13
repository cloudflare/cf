/** @generated from logs.received.fields.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/received/fields`,
} as const;
