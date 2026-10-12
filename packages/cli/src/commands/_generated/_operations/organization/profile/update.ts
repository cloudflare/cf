/** @generated from Organizations_modifyProfile */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/profile`,
	body: "json",
	response: false,
} as const;
