/** @generated from zero-trust.apps.review.status.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/apps/review_status`,
	body: "json",
} as const;
