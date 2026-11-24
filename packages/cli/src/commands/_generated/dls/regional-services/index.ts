import $prefixbindings from "./prefix-bindings/index.js";
/**
 * regional-services command group
 * @generated from apis/overlays/dls.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regional-services",
	describe: "Operations for regional-services",

	routes: {
		"prefix-bindings": $prefixbindings,
	},
});

export default command;
