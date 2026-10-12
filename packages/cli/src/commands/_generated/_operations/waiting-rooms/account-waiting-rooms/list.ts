/** @generated from waiting-rooms.account-waiting-rooms.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/waiting_rooms`,
	query: ["page", "per_page"],
} as const;
