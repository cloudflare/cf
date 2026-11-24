/**
 * query command
 * @generated from apis/overlays/sql.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"scope-account": {
			kind: "parsed",
			brief:
				"Account tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
			optional: true,
			parse: String,
		},
		"scope-zone": {
			kind: "parsed",
			brief:
				"Zone tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
			optional: true,
			parse: String,
		},
		"time-until": {
			kind: "parsed",
			brief: "Inclusive upper bound for the dataset's timestamp column.",
			optional: true,
			parse: String,
		},
		"time-since": {
			kind: "parsed",
			brief: "Inclusive lower bound for the dataset's timestamp column.",
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
	operands: [
		{
			placeholder: "query",
			brief:
				"SQL query to execute. A trailing FORMAT selects JSON, JSONEachRow, TabSeparated, or TSV output on any dataset. ",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("scope-account", ["scope-zone"]);
		rules.conflicts("scope-zone", ["scope-account"]);
		rules.check((argv) => {
			const groupSet = ["time-until", "time-since"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["time-since"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --time-until, --time-since is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query <query>",
	describe: "Query analytics datasets",
	usage:
		"$0 sql query <query>\n\nExecutes a SQL query against the analytics datasets available to the caller. Send either raw SQL or a JSON object containing the query and optional positional or named parameters, time range, and account or zone scope. Raw SQL placeholders can also be bound with query parameters named `param_<name>`. A trailing `FORMAT JSON`, `FORMAT JSONEachRow`, `FORMAT TabSeparated`, or `FORMAT TSV` is supported for all datasets. Without FORMAT, each backend retains its existing default JSON response.",
	...parameters,
	loader: () => import("./query.handler.js"),
});

export default command;
