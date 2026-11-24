/**
 * update command
 * @generated from apis/overlays/registrar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		prefer: {
			kind: "parsed",
			brief:
				"Set to `respond-async` to receive an immediate `202 Accepted` without\nwaiting for the operation to complete (RFC 7240).",
			optional: true,
			parse: String,
		},
		"auto-renew": {
			kind: "boolean",
			brief:
				"Enable or disable automatic renewal.\nSetting this field to `true` authorizes Cloudflare to charge the\naccount's default payment method up to 30 days before domain expiry\nto renew the domain automatically. Renewal pricing may change over\ntime based on registry pricing.\n",
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
				"Request to update an existing domain registration.  This endpoint currently supports updating `auto_renew` only. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "domain-name",
			brief: "Domain name to update.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <domain-name>",
	describe: "Update Registration",
	usage:
		"$0 registrar registrations update <domain-name>\n\nUpdates an existing domain registration. By default, the server holds the connection for a bounded, server-defined amount of time while the update completes. Most updates finish within this window and return `200 OK` with a completed workflow status. If the update is still processing after this synchronous wait window, the server returns `202 Accepted`. Poll the URL in `links.self` to track progress. To skip the wait and receive an immediate `202`, send `Prefer: respond-async`. This endpoint currently supports updating `auto_renew` only.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
