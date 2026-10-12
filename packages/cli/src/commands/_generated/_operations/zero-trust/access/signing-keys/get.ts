/** @generated from access-key-configuration-get-the-access-key-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/keys`,
} as const;
