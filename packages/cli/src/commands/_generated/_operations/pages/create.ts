/** @generated from pages-project-create-project */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects`,
	body: "json",
} as const;
