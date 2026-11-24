import $extensions from "./extensions/index.js";
import $registrations from "./registrations/index.js";
/**
 * registrar command
 * @generated from apis/overlays/registrar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "registrar",
	describe: "registrar",

	routes: {
		extensions: $extensions,
		registrations: $registrations,
	},
});

export default command;
