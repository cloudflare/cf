import { CliExit } from "./cli-exit.js";
import type { Argv, CommandModule } from "yargs";

/**
 * All hand-written commands advertise --dry-run. Commands with their own
 * preview implementation keep control of the flag; the others stop after
 * yargs has parsed and validated their arguments, before their handler runs.
 *
 * A generic preview deliberately omits argument values. Some hand-written
 * commands accept tokens, secrets, URLs, or arbitrary process arguments.
 */
export function withHandWrittenDryRun<T, U>(
	command: CommandModule<T, U>,
	strategy: "preview" | "native"
): CommandModule<T, U> {
	return {
		...command,
		builder: (yargs) => {
			const withDryRun = yargs.option("dry-run", {
				type: "boolean",
				default: false,
				global: true,
				description:
					"Parse arguments and show the command without executing it",
			});
			if (strategy === "preview") {
				withDryRun.middleware((argv) => {
					if (argv["dry-run"] !== true || argv.help) {
						return;
					}
					console.log(
						JSON.stringify(
							{
								command: `cf ${argv._.map(String).join(" ")}`,
								dryRun: true,
								executed: false,
								validated: "arguments only",
							},
							null,
							2
						)
					);
					throw new CliExit(0);
				});
			}

			const builder = command.builder;
			if (typeof builder === "function") {
				return builder(withDryRun) as Argv<U>;
			}
			if (builder !== undefined) {
				return withDryRun.options(builder) as unknown as Argv<U>;
			}
			return withDryRun as Argv<U>;
		},
	};
}
