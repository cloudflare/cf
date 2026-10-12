/** @generated from share-excluded-recipients-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/shares/${request.share_id}/excluded-recipients`,
	body: "json",
	response: false,
} as const;
