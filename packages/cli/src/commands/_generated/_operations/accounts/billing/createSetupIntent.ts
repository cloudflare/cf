/** @generated from account-billing-create-setup-intent */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/client-secret`,
} as const;
