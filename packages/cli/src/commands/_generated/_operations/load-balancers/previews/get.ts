/** @generated from load-balancers.previews.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/preview/${request.preview_id}`,
} as const;
