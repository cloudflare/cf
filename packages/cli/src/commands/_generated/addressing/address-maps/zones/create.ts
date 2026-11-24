/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "member-zone-id",
			brief: "Identifier of a zone.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <member-zone-id>",
	describe: "Add a zone membership to an Address Map",
	usage:
		"$0 addressing address-maps zones create <member-zone-id>\n\nAdd a zone as a member of a particular address map.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
