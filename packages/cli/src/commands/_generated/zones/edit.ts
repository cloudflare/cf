/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		paused: {
			kind: "boolean",
			brief:
				"Indicates whether the zone is only using Cloudflare DNS services. A\ntrue value means the zone will not receive security or performance\nbenefits.\n",
			optional: true,
		},
		"plan-id": {
			kind: "parsed",
			brief: "Identifier",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"A full zone implies that DNS is hosted with Cloudflare. A partial\nzone is typically a partner-hosted zone or a CNAME setup. This\nparameter is only available to Enterprise customers or if it has\nbeen explicitly enabled on a zone.\n",
			optional: true,
			choices: ["full", "partial", "secondary", "internal"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"vanity-name-servers": {
			kind: "parsed",
			brief:
				"An array of domains used for custom name servers. This is only\navailable for Business and Enterprise plans.",
			variadic: true,
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
	command: "edit",
	describe: "Edit Zone",
	usage:
		"$0 zones edit\n\nEdits a zone. Only one zone property can be changed at a time.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
