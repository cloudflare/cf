/** @generated from resource-sharing.resources.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/resources/${request.share_resource_id}`,
	body: "json",
} as const;
