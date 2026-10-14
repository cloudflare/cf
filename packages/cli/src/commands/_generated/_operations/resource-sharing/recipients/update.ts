/** @generated from resource-sharing.recipients.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/shares/${request.share_id}/recipients`,
	body: "json",
	response: false,
} as const;
