/** @generated from waiting-room-create-waiting-room-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/rules`,
	body: "json",
	constants: {
		action: "bypass_waiting_room",
	},
} as const;
