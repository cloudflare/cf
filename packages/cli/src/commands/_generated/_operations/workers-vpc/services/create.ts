/** @generated from connectivity-services-post */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/connectivity/directory/services`,
	body: "json",
} as const;
