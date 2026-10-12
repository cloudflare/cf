/** @generated from zone-cache-settings-delete-variants-setting */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/variants`,
} as const;
