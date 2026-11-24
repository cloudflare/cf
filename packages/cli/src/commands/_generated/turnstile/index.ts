import $widgets from "./widgets/index.js";
/**
 * turnstile command
 * @generated from apis/overlays/turnstile.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "turnstile",
	describe:
		"CAPTCHA-free bot verification widgets that protect forms and APIs without degrading user experience",

	routes: {
		widgets: $widgets,
	},
});

export default command;
