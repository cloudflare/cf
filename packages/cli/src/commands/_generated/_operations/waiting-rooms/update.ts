/** @generated from waiting-room-update-waiting-room */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}`,
	body: "json",
} as const;
