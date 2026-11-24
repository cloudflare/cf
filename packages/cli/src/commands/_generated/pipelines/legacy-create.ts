/**
 * legacy-create command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"destination-batch-max-bytes": {
			kind: "parsed",
			brief: "Specifies rough maximum size of files.",
			default: "100000000",
			parse: Number,
		},
		"destination-batch-max-duration-s": {
			kind: "parsed",
			brief: "Specifies duration to wait to aggregate batches files.",
			default: "300",
			parse: Number,
		},
		"destination-batch-max-rows": {
			kind: "parsed",
			brief: "Specifies rough maximum number of rows per file.",
			default: "10000000",
			parse: Number,
		},
		"destination-compression-type": {
			kind: "parsed",
			brief: "Specifies the desired compression algorithm and format.",
			default: "gzip",
			choices: ["none", "gzip", "deflate"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-compression-type", "text"),
		},
		"destination-credentials-access-key-id": {
			kind: "parsed",
			brief: "Specifies the R2 Bucket Access Key Id.",
			optional: true,
			parse: String,
		},
		"destination-credentials-endpoint": {
			kind: "parsed",
			brief: "Specifies the R2 Endpoint.",
			optional: true,
			parse: String,
		},
		"destination-credentials-secret-access-key": {
			kind: "parsed",
			brief: "Specifies the R2 Bucket Secret Access Key.",
			optional: true,
			parse: String,
		},
		"destination-format": {
			kind: "parsed",
			brief: "Specifies the format of data to deliver.",
			optional: true,
			choices: ["json"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-format", "text"),
		},
		"destination-path-bucket": {
			kind: "parsed",
			brief: "Specifies the R2 Bucket to store files.",
			optional: true,
			parse: String,
		},
		"destination-path-filename": {
			kind: "parsed",
			brief: "Specifies the name pattern to for individual data files.",
			optional: true,
			parse: String,
		},
		"destination-path-filepath": {
			kind: "parsed",
			brief: "Specifies the name pattern for directory.",
			optional: true,
			parse: String,
		},
		"destination-path-prefix": {
			kind: "parsed",
			brief: "Specifies the base directory within the bucket.",
			optional: true,
			parse: String,
		},
		"destination-type": {
			kind: "parsed",
			brief: "Specifies the type of destination.",
			optional: true,
			choices: ["r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-type", "text"),
		},
		name: {
			kind: "parsed",
			brief: "Defines the name of the pipeline.",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief:
				'The source field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"format": "json", "type": string, "authentication"?: boolean, "cors"?: {...}} | {"format": "json", "type": string})]. ? marks optional keys.',
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
	command: "legacy-create",
	describe: "[DEPRECATED] Create Pipeline",
	usage:
		"$0 pipelines legacy-create\n\n[DEPRECATED] Create a new pipeline. Use the new /pipelines/v1/pipelines endpoint instead.",
	...parameters,
	loader: () => import("./legacy-create.handler.js"),
});

export default command;
