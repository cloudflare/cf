/** @generated from getResourceLibraryCategoryById */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/categories/${request.id}`,
} as const;
