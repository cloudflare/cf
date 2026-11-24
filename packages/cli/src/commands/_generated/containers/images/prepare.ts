/**
 * prepare command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		image: {
			kind: "parsed",
			brief: "Image url.",
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
				"A digest-pinned managed container image to prepare for the new runtime.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "prepare",
	describe: "Prepare a container image",
	usage:
		"$0 containers images prepare\n\nIdempotently starts or observes preparation of the runtime artifacts required to run one digest-pinned managed container image on Cloudflare's network. Returns 202 while durable preparation continues and 200 when the image is ready or preparation has reached a terminal error.",
	...parameters,
	loader: () => import("./prepare.handler.js"),
});

export default command;
