import $botclass from "./bot-class/index.js";
import $browserfamily from "./browser-family/index.js";
import $devicetype from "./device-type/index.js";
import $get from "./get.js";
import $httpprotocol from "./http-protocol/index.js";
import $httpversion from "./http-version/index.js";
import $ipversion from "./ip-version/index.js";
import $os from "./os/index.js";
import $tlsversion from "./tls-version/index.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locations",
	describe: "Operations for http.top.locations",

	routes: {
		get: $get,
		"bot-class": $botclass,
		"browser-family": $browserfamily,
		"device-type": $devicetype,
		"http-protocol": $httpprotocol,
		"http-version": $httpversion,
		"ip-version": $ipversion,
		os: $os,
		"tls-version": $tlsversion,
	},
});

export default command;
