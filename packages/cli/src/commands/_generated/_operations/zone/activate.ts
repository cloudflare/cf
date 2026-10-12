/** @generated from put-zones-zone_id-activation_check */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/activation_check`,
} as const;
