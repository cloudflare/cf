/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "A short description of the watermark profile.",
			default: "",
			parse: String,
		},
		opacity: {
			kind: "parsed",
			brief:
				"The translucency of the image. A value of `0.0` makes the image completely transparent, and `1.0` makes the image completely opaque. Note that if the image is already semi-transparent, setting this to `1.0` will not make the image completely opaque.",
			default: "1",
			parse: Number,
		},
		padding: {
			kind: "parsed",
			brief:
				"The whitespace between the adjacent edges (determined by position) of the video and the image. `0.0` indicates no padding, and `1.0` indicates a fully padded video width or length, as determined by the algorithm.",
			default: "0.05",
			parse: Number,
		},
		position: {
			kind: "parsed",
			brief:
				"The location of the image. Valid positions are: `upperRight`, `upperLeft`, `lowerLeft`, `lowerRight`, and `center`. Note that `center` ignores the `padding` parameter.",
			default: "upperRight",
			parse: String,
		},
		scale: {
			kind: "parsed",
			brief:
				"The size of the image relative to the overall size of the video. This parameter will adapt to horizontal and vertical videos automatically. `0.0` indicates no scaling (use the size of the image as-is), and `1.0 `fills the entire video.",
			default: "0.15",
			parse: Number,
		},
		url: {
			kind: "parsed",
			brief: "URL of the watermark image to copy.",
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create watermark profiles via basic upload",
	usage:
		"$0 stream watermarks create\n\nCreates watermark profiles using a single `HTTP POST multipart/form-data` request.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
