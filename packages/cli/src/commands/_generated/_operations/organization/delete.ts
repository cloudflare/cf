/** @generated from Organizations_delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}`,
} as const;
