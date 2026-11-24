/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": { kind: "parsed", brief: "Gateway ID", parse: String },
		elements: {
			kind: "parsed",
			brief:
				'The elements field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string, "outputs": {...}, "type": "start"} | {"id": string, "outputs": {...}, "properties": {...}, "type": "conditional"} | {"id": string, "outputs": {...}, "type": "percentage"} | ...more)].',
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <id>",
	describe: "Create a dynamic route version",
	usage:
		"$0 ai-gateway dynamic-routing versions create <id>\n\nCreates a new version of a dynamic route from the specified routing elements. The version does not serve traffic until you deploy it.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
