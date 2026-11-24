/**
 * upload command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-type": {
			kind: "parsed",
			brief:
				"RFI project type. Valid values: threat-intelligence, incident-response, ir-emergency-response, table-top, pentest, irp, threat-hunting, cybersecurity-assessment, react-general, legal-response, soc-alerts, demo",
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description of the asset",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Optional JSON string of key-value pairs (e.g., \'{"key1":"value1"}\')',
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `source` form field. The file to upload (can also use 'file')",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "request-id", brief: "RFI UUID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "upload <request-id>",
	describe: "Upload asset to request (Customer)",
	usage:
		"$0 cloudforce-one requests assets upload <request-id>\n\nUpload a file asset to R2 storage and associate it with a request. Customer can only upload to their own account.",
	...parameters,
	loader: () => import("./upload.handler.js"),
});

export default command;
