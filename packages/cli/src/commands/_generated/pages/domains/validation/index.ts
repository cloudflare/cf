import $retry from "./retry.js";
/**
 * validation command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "validation",
	describe: "Operations for domains.validation",

	routes: {
		retry: $retry,
	},
});

export default command;
