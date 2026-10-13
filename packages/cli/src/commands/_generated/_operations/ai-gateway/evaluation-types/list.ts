/** @generated from ai-gateway.evaluation-types.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/evaluation-types`,
	query: ["page", "per_page", "order_by", "order_by_direction"],
	errors: {
		400: "BadRequestError",
	},
} as const;
