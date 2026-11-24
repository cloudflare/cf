/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'S3 actions allowed on the credentials; requests for any other action are denied. For example, `["GetObject", "HeadObject"]` allows reading objects without listing them. Exactly one of `permission` or `actions` must be provided. The parent token must have Object Read & Write permission if any action writes, and Object Read otherwise.',
			variadic: true,
			optional: true,
			parse: String,
		},
		bucket: {
			kind: "parsed",
			brief: "Name of the R2 bucket.",
			optional: true,
			parse: String,
		},
		objects: {
			kind: "parsed",
			brief: "Optional object paths to scope the credentials to.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"parent-access-key-id": {
			kind: "parsed",
			brief:
				"Access key ID of the parent R2 API token. The temporary credentials cannot exceed this token's permissions.",
			optional: true,
			parse: String,
		},
		permission: {
			kind: "parsed",
			brief:
				"Permissions allowed on the credentials. Exactly one of `permission` or `actions` must be provided.",
			optional: true,
			choices: [
				"admin-read-write",
				"admin-read-only",
				"object-read-write",
				"object-read-only",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "permission", "text"),
		},
		prefixes: {
			kind: "parsed",
			brief: "Optional prefix paths to scope the credentials to.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ttl-seconds": {
			kind: "parsed",
			brief:
				"Lifetime of the temporary credentials in seconds, up to 604800 seconds (7 days).",
			default: "900",
			parse: Number,
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
	describe: "Create Temporary Access Credentials",
	usage:
		"$0 r2 temporary-credentials create\n\nCreates temporary access credentials on a bucket that can be optionally scoped to prefixes or objects. The credentials grant either a permission level or an explicit list of S3 actions.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
