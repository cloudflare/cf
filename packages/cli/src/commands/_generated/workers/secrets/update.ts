/**
 * update command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		text: {
			kind: "parsed",
			brief: "The secret value to use.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The kind of resource that the binding provides.",
			optional: true,
			choices: ["secret_text", "secret_key"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		algorithm: {
			kind: "parsed",
			brief:
				'Algorithm-specific key parameters. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#algorithm). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		format: {
			kind: "parsed",
			brief:
				"Data format of the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#format).",
			optional: true,
			choices: ["raw", "pkcs8", "spki", "jwk"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "format", "text"),
		},
		"key-base64": {
			kind: "parsed",
			brief:
				'Base64-encoded key data. Required if `format` is "raw", "pkcs8", or "spki".',
			optional: true,
			parse: String,
		},
		"key-jwk": {
			kind: "parsed",
			brief:
				'Key data in [JSON Web Key](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#json_web_key) format. Required if `format` is "jwk". Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		usages: {
			kind: "parsed",
			brief:
				"Allowed operations with the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#keyUsages).",
			variadic: true,
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
			brief: "A secret value accessible through a binding.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "name",
			brief: "A JavaScript variable name for the binding.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("text", [
			"algorithm",
			"format",
			"key-base64",
			"key-jwk",
			"usages",
		]);
		rules.conflicts("algorithm", ["text"]);
		rules.implies("algorithm", ["format", "usages"]);
		rules.conflicts("format", ["text"]);
		rules.implies("format", ["algorithm", "usages"]);
		rules.conflicts("key-base64", ["text"]);
		rules.implies("key-base64", ["algorithm", "format", "usages"]);
		rules.conflicts("key-jwk", ["text"]);
		rules.implies("key-jwk", ["algorithm", "format", "usages"]);
		rules.conflicts("usages", ["text"]);
		rules.implies("usages", ["algorithm", "format"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <name>",
	describe: "Add a secret to a Worker script",
	usage:
		'$0 workers secrets update <name>\n\nAdd a secret to a Worker script by creating a new version with that secret. When changing more than one secret at a time, prefer the "Patch multiple script secrets" API instead of changing many secrets individually.',
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
