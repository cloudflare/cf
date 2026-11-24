import $certificates from "./certificates/index.js";
/**
 * certificate-pack command group
 * @generated from apis/overlays/custom-hostnames.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "certificate-pack",
	describe: "Operations for certificate-pack",

	routes: {
		certificates: $certificates,
	},
});

export default command;
