/** @generated from dcv-delegation-uuid-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dcv_delegation/uuid`,
} as const;
