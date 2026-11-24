/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			default: "ubiquitous",
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "bundle-method", "text"),
		},
		certificate: {
			kind: "parsed",
			brief:
				"The zone's SSL certificate or certificate and the intermediate(s).",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Analyze Certificate",
	usage:
		"$0 ssl analyze create\n\nReturns the set of hostnames, the signature algorithm, and the expiration date of the certificate.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
