/** @generated from share-resources-get-by-id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/resources/${request.share_resource_id}`,
} as const;
