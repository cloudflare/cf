/**
 * list command
 * @generated from apis/overlays/url-scanner.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		size: {
			kind: "parsed",
			brief: "Limit the number of objects in the response.",
			optional: true,
			parse: Number,
		},
		query: {
			kind: "parsed",
			brief: "Filter scans",
			optional: true,
			parse: String,
		},
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
	command: "list",
	describe: "Search URL scans",
	usage:
		"$0 url-scanner scans list\n\nUse a subset of ElasticSearch Query syntax to filter scans. Some example queries:<br/> <br/>- 'path:\"/bundles/jquery.js\"': Searches for scans who requested resources with the given path.<br/>- 'page.asn:AS24940 AND hash:xxx': Websites hosted in AS24940 where a resource with the given hash was downloaded.<br/>- 'page.domain:microsoft* AND verdicts.malicious:true AND NOT page.domain:microsoft.com': malicious scans whose hostname starts with \"microsoft\".<br/>- 'apikey:me AND date:[2025-01 TO 2025-02]': my scans from 2025 January to 2025 February.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
