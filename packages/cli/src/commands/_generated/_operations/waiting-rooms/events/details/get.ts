/** @generated from waiting-rooms.events.details.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/events/${request.event_id}/details`,
} as const;
