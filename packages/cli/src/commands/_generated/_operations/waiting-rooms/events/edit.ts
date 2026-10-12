/** @generated from waiting-room-patch-event */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/events/${request.event_id}`,
	body: "json",
} as const;
