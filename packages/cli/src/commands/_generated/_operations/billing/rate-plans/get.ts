/** @generated from billing-get-rate-plan */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/billing/rate_plans/${request.public_key}`,
} as const;
