import $agents from "./agents/index.js";
import $destinations from "./destinations/index.js";
import $issues from "./issues/index.js";
import $metricsexport from "./metrics-export/index.js";
import $queries from "./queries/index.js";
import $sharedqueries from "./shared-queries/index.js";
import $telemetry from "./telemetry/index.js";
import $tracing from "./tracing/index.js";
import $usage from "./usage.js";
/**
 * o11y command
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "o11y",
	describe: "o11y",

	routes: {
		usage: $usage,
		agents: $agents,
		destinations: $destinations,
		issues: $issues,
		"metrics-export": $metricsexport,
		queries: $queries,
		"shared-queries": $sharedqueries,
		telemetry: $telemetry,
		tracing: $tracing,
	},
});

export default command;
