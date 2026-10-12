/** @generated from Members_batchCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/members:batchCreate`,
	body: "json",
} as const;
