import $get from "./get.js";
import $kickall from "./kick-all.js";
import $kick from "./kick.js";
import $muteall from "./mute-all.js";
import $mute from "./mute.js";
import $polls from "./polls/index.js";
/**
 * active command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "active",
	describe: "Live meeting state and participant controls",

	routes: {
		get: $get,
		kick: $kick,
		"kick-all": $kickall,
		mute: $mute,
		"mute-all": $muteall,
		polls: $polls,
	},
});

export default command;
