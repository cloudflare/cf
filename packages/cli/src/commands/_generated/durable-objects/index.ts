import $namespaces from "./namespaces/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * durable-objects command
 * @generated from apis/overlays/durable-objects.ts
 */
import type { CommandModule } from "yargs";
import $export from "#commands/durable-objects/export/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "durable-objects",
	describe:
		"Stateful serverless objects with transactional storage, ideal for coordination, sessions, and real-time collaboration",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($export, "native"))
			.command($namespaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
