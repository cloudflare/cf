/** @generated from images.variants.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/variants`,
	body: "json",
} as const;
