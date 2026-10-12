/** @generated from getFieldExtractor */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/field_extractors/${request.extractor}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
