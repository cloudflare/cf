/** @generated from network.routes.cidr.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes`,
	body: "json",
} as const;
