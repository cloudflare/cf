/**
 * get command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Image Transformations C2PA setting",
	usage:
		"$0 zones transformations-c2pa get\n\nC2PA (Coalition for Content Provenance and Authenticity) signing adds cryptographic metadata to images processed through Cloudflare Image Transformations, enabling verification of image authenticity and provenance.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
