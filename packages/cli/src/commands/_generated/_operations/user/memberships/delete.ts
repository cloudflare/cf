/** @generated from user'-s-account-memberships-delete-membership */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/memberships/${request.membership_id}`,
} as const;
