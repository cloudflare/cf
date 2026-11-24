import $extensions from "./extensions/index.js";
import $registrations from "./registrations/index.js";
/**
 * registrar-sandbox command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "registrar-sandbox",
	describe: "registrar-sandbox",

	routes: {
		extensions: $extensions,
		registrations: $registrations,
	},
});

export default command;
