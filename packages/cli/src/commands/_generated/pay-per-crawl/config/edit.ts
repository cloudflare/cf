/**
 * edit command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bot-overrides": {
			kind: "parsed",
			brief:
				'The bot_overrides field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": "charge" | "bypass"}.',
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		"price-usd-microcents": {
			kind: "parsed",
			brief:
				"Price in microcents 1 USD = 100,000,000 microcents. Must be 0 or a multiple of 100,000 $0.001. Range: $0.001–$9,999.999.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Data for setting flag on zones",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Changes pay-per-crawl config for a zone",
	usage:
		"$0 pay-per-crawl config edit\n\nChanges the pay-per-crawl config for a zone.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
