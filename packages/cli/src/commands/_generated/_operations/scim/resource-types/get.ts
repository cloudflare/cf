/** @generated from scim-resource-types-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/ResourceTypes/${request.resource_type_id}`,
} as const;
