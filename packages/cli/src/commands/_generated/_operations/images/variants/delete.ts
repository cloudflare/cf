/** @generated from images.variants.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/variants/${request.variant_id}`,
} as const;
