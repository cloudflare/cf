/** @generated from field-extractors.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/field_extractors/${request.extractor}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
