/** @generated from waiting-room-delete-waiting-room-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/rules/${request.rule_id}`,
} as const;
