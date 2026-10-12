/** @generated from accounts.ut-billing.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/ut-billing`,
} as const;
