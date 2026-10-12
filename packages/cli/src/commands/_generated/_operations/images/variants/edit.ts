/** @generated from images.variants.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/variants/${request.variant_id}`,
	body: "json",
} as const;
