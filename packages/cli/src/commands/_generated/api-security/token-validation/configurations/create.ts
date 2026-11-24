/**
 * create command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"credentials-keys": {
			kind: "parsed",
			brief:
				'The credentials.keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"kid": string} & {"alg": "RS256" | "RS384" | "RS512" | ...more, "e": string, "kty": "RSA", "n": string}) | ({"kid": string} & {"kty": "EC", "x": string, "y": string} & {"alg": "ES256", "crv": "P-256"}) | ...more)].',
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "The title field",
			optional: true,
			parse: String,
		},
		"token-type": {
			kind: "parsed",
			brief: "The token_type field",
			optional: true,
			choices: ["JWT"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "token-type", "text"),
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
	describe: "Create a token validation configuration",
	usage:
		"$0 api-security token-validation configurations create\n\nCreates a JWT validation configuration for the zone.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
