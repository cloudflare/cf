/** @generated from user'-s-account-memberships-update-membership */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/memberships/${request.membership_id}`,
	body: "json",
} as const;
