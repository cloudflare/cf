import $apps from "./apps/index.js";
/**
 * sfu command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sfu",
	describe: "SFU apps that route WebRTC media and data between participants",

	routes: {
		apps: $apps,
	},
});

export default command;
