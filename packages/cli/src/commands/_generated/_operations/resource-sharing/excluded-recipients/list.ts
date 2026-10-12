/** @generated from share-excluded-recipients-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/shares/${request.share_id}/excluded-recipients`,
	query: ["page", "per_page"],
} as const;
