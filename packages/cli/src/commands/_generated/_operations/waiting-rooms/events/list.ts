/** @generated from waiting-rooms.events.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/events`,
	query: ["page", "per_page"],
} as const;
