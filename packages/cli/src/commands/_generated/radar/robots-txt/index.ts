import $top from "./top/index.js";
/**
 * robots-txt command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "robots-txt",
	describe: "Robots.txt adoption and crawler directive trends across the web",

	routes: {
		top: $top,
	},
});

export default command;
