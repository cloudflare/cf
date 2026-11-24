/**
 * edit command
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
				"Request payload for PATCH credentials. Provided keys define the complete stored key set, and stored keys omitted from payload are removed. For each provided key identity (`{alg,kid}`), payload fields overwrite the stored key before validation and omitted fields inherit from the stored key. Key identities must be unique.",
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
	command: "edit <config-id>",
	describe: "Edit token validation credentials",
	usage:
		"$0 api-security token-validation configurations credentials edit <config-id>\n\nUpdates the configuration's complete key set while allowing omitted fields on existing keys to retain stored values. Omitted key identities are removed.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
