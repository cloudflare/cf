/** @generated from account-billing-pay-bad-debt */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-bad-debt`,
	body: "json",
} as const;
