/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		dimensions: {
			kind: "parsed",
			brief:
				"Can be used to break down the data by given attributes. Options are:\n\nDimension                 | Name                            | Example\n--------------------------|---------------------------------|--------------------------\nevent                     | Connection Event                | connect, progress, disconnect, originError, clientFiltered\nappID                     | Application ID                  | 40d67c87c6cd4b889a4fd57805225e85\ncoloName                  | Colo Name                       | SFO\nipVersion                 | IP version used by the client   | 4, 6.",
			variadic: true,
			optional: true,
			choices: ["event", "appID", "coloName", "ipVersion"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		sort: {
			kind: "parsed",
			brief:
				"The sort order for the result set; sort fields must be included in `metrics` or `dimensions`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		until: { kind: "parsed", brief: "Until", optional: true, parse: String },
		metrics: {
			kind: "parsed",
			brief:
				"One or more metrics to compute. Options are:\n\nMetric                    | Name                                | Example                  | Unit\n--------------------------|-------------------------------------|--------------------------|--------------------------\ncount                     | Count of total events               | 1000                     | Count\nbytesIngress              | Sum of ingress bytes                | 1000                     | Sum\nbytesEgress               | Sum of egress bytes                 | 1000                     | Sum\ndurationAvg               | Average connection duration         | 1.0                      | Time in milliseconds\ndurationMedian            | Median connection duration          | 1.0                      | Time in milliseconds\nduration90th              | 90th percentile connection duration | 1.0                      | Time in milliseconds\nduration99th              | 99th percentile connection duration | 1.0                      | Time in milliseconds.",
			variadic: true,
			optional: true,
			choices: [
				"count",
				"bytesIngress",
				"bytesEgress",
				"durationAvg",
				"durationMedian",
				"duration90th",
				"duration99th",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		filters: {
			kind: "parsed",
			brief:
				"Used to filter rows by one or more dimensions. Filters can be combined using OR and AND boolean logic. AND takes precedence over OR in all the expressions. The OR operator is defined using a comma (,) or OR keyword surrounded by whitespace. The AND operator is defined using a semicolon (;) or AND keyword surrounded by whitespace. Note that the semicolon is a reserved character in URLs (rfc1738) and needs to be percent-encoded as %3B. Comparison options are:\n\nOperator                  | Name                            | URL Encoded\n--------------------------|---------------------------------|--------------------------\n==                        | Equals                          | %3D%3D\n!=                        | Does not equals                 | !%3D\n\\>                        | Greater Than                    | %3E\n\\<                        | Less Than                       | %3C\n\\>=                       | Greater than or equal to        | %3E%3D\n\\<=                       | Less than or equal to           | %3C%3D\n\nUse the above to construct filters.",
			optional: true,
			parse: String,
		},
		since: { kind: "parsed", brief: "Since", optional: true, parse: String },
		"time-delta": {
			kind: "enum",
			brief: "Used to select time series resolution.",
			values: [
				"year",
				"quarter",
				"month",
				"week",
				"day",
				"hour",
				"dekaminute",
				"minute",
			],
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
	command: "get",
	describe: "Get analytics by time",
	usage:
		"$0 spectrum analytics events bytimes get\n\nRetrieves a list of aggregate metrics grouped by time interval.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
