import $active from "./active/index.js";
import $control from "./control.js";
import $get from "./get.js";
import $list from "./list.js";
import $start from "./start.js";
import $tracks from "./tracks/index.js";
/**
 * recordings command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "recordings",
	describe: "Meeting and participant-track recordings and recording controls",

	routes: {
		control: $control,
		get: $get,
		list: $list,
		start: $start,
		active: $active,
		tracks: $tracks,
	},
});

export default command;
