/** @generated from custom-hostnames.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames`,
	body: "json",
} as const;
