/** @generated from cws-create-deployment */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/deployments`,
	body: "json",
} as const;
