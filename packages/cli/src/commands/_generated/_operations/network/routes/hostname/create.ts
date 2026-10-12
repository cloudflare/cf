/** @generated from zero-trust-networks-route-hostname-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/routes/hostname`,
	body: "json",
} as const;
