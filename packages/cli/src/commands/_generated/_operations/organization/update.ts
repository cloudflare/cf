/** @generated from Organizations_modify */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}`,
	body: "json",
} as const;
