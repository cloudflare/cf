/** @generated from list-client-versions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/client-versions`,
	query: ["target_environment", "release_track", "page", "per_page"],
} as const;
