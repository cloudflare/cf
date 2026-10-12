/** @generated from get_UserGetSelf */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/user/me`,
	errors: {
		404: "NotFoundError",
	},
} as const;
