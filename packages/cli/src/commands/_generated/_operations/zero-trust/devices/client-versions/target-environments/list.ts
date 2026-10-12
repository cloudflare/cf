/** @generated from list-client-target-environments */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/client-versions/target-environments`,
} as const;
