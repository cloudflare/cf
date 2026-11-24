/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		keys: {
			kind: "parsed",
			brief:
				'The keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"kid": string} & {"alg": "RS256" | "RS384" | "RS512" | ...more, "e": string, "kty": "RSA", "n": string}) | ({"kid": string} & {"kty": "EC", "x": string, "y": string} & {"alg": "ES256", "crv": "P-256"}) | ...more)].',
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
			brief:
				"Request payload for create and PUT credentials operations. Provided keys define the complete stored key set. Key identities (`{alg,kid}`) must be unique.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "config-id",
			brief: "Token Configuration ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <config-id>",
	describe: "Replace token validation credentials",
	usage:
		"$0 api-security token-validation configurations credentials update <config-id>\n\nReplaces the configuration's complete key set. Symmetric keys must include their key material.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
