/** @generated from waiting-rooms.rules.edit */
export default {
	method: "PATCH",
	path: "/zones/{zone_id}/waiting_rooms/{waiting_room_id}/rules/{rule_id}",
	body: "json",
	constants: {
		action: "bypass_waiting_room",
	},
} as const;
