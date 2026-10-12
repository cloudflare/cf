/** @generated from updateResourceLibraryApplication */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications/${request.id}`,
	body: "json",
} as const;
