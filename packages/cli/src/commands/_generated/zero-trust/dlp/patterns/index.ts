import $validate from "./validate.js";
/**
 * patterns command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "patterns",
	describe:
		"Data Loss Prevention - validate regular expressions used for content detection",

	routes: {
		validate: $validate,
	},
});

export default command;
