/** @generated from account-level-custom-nameservers-delete-account-custom-nameserver */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/custom_ns/${request.custom_ns_id}`,
} as const;
