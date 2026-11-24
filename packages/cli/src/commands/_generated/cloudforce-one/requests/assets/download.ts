/**
 * download command
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
		"request-id": { kind: "parsed", brief: "RFI UUID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [{ placeholder: "asset-id", brief: "Asset UUID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "download <asset-id>",
	describe: "Download asset (Customer)",
	usage:
		"$0 cloudforce-one requests assets download <asset-id>\n\nDownload a file asset from R2 storage. Customer can only download from their own account.",
	...parameters,
	loader: () => import("./download.handler.js"),
});

export default command;
