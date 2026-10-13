/** @generated from zero-trust.apps.review.status.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/apps/review_status`,
} as const;
