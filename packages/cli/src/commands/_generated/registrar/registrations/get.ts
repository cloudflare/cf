/**
 * get command
 * @generated from apis/overlays/registrar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "domain-name",
			brief: "Domain name to retrieve.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <domain-name>",
	describe: "Get Registration",
	usage:
		"$0 registrar registrations get <domain-name>\n\nReturns the current state of a domain registration. This is the canonical read endpoint for a domain you own. It returns the full registration resource including current settings and expiration. When the registration resource is ready, both `created_at` and `expires_at` are present in the response.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
