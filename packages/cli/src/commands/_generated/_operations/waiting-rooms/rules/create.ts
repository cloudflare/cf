/** @generated from waiting-rooms.rules.create */
export default {
	method: "POST",
	path: "/zones/{zone_id}/waiting_rooms/{waiting_room_id}/rules",
	body: "json",
	constants: {
		action: "bypass_waiting_room",
	},
} as const;
