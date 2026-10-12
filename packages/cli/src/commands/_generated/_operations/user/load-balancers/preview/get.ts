/** @generated from load-balancer-monitors-preview-result */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/preview/${request.preview_id}`,
} as const;
