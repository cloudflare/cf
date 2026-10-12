/** @generated from pages.build-cache.purge */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/purge_build_cache`,
} as const;
