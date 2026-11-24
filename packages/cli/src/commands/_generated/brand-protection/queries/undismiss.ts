/**
 * undismiss command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"query-id": {
			kind: "parsed",
			brief: "ID of the domain query that the match belongs to.",
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
			placeholder: "domain-id",
			brief:
				"ID of the matched domain, as returned in \`domain_id\` by List domain matches with \`include_domain_id=true\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "undismiss <domain-id>",
	describe: "Undismiss a domain match",
	usage:
		"$0 brand-protection queries undismiss <domain-id>\n\nRemoves the dismissed status from a matched domain for one domain query. Undismissing a domain in one query does not affect other queries. Get `domain_id` from List domain matches with `include_domain_id=true`. Undismissing a match that is not dismissed succeeds. If the query or match does not exist, the request fails with error code 404.",
	...parameters,
	loader: () => import("./undismiss.handler.js"),
});

export default command;
