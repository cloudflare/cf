/** @generated from resource-sharing.recipients.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/shares/${request.share_id}/recipients`,
	body: "json",
} as const;
