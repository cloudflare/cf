/**
 * edit command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"flexible-variants": {
			kind: "boolean",
			brief:
				"Whether flexible variants are enabled. When `true`, hosted images can be transformed with options in the URL (for example `https://imagedelivery.net/<ACCOUNT_HASH>/<IMAGE_ID>/w=400,sharpen=3`) instead of only through named variants. When `false` or absent, only named variants can be requested.\n",
			optional: true,
		},
		"preserve-content-credentials": {
			kind: "boolean",
			brief:
				"Retain C2PA provenance metadata on images delivered from hosted Cloudflare Images. When enabled, Cloudflare keeps any existing Content Credentials in the source image and cryptographically signs the transformations it applies during delivery.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Settings to change. Settings omitted from the request are left unchanged.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Update Images account configuration",
	usage:
		"$0 images config edit\n\nUpdate account-level Cloudflare Images settings. Only the settings included in the request are changed.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
