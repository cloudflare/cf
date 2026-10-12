/** @generated from user'-s-account-memberships-membership-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/memberships/${request.membership_id}`,
} as const;
