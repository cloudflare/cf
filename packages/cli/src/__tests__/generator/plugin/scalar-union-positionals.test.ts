import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type Argv } from "yargs";
import { builderLines } from "../../../../generator/plugin/emit/builder.js";
import { handler, imports } from "../../../../generator/plugin/emit/handler.js";
import { context as emitContext } from "../../../../generator/plugin/emit/index.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
	parseScalarValue,
} from "../../../lib/body-parser.js";
import {
	bodyParam,
	method,
	operation,
	wire,
} from "../../helpers/cli-plugin.js";

describe.each([true, false])(
	"scalar-union positionals (typed request: %s)",
	(typed) => {
		runInTempDir();
		const [ctx, command] = emitContext(
			method("create", "things-create", {
				params: { threshold: { positional: true, required: true } },
			}),
			"things",
			undefined,
			operation("post", "/things", {
				bodyParams: [bodyParam("threshold", "scalarUnion", ["threshold"])],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
				wire: wire({ hasRequest: typed, body: "json" }),
			}),
			"./"
		);
		const builder = new Script(
			`(yargs) => yargs\n${builderLines(ctx).join("\n")}`
		).runInNewContext() as (args: Argv) => Argv;
		const source = stripTypeScriptTypes(
			`(async (argv) => {\n${handler(ctx).join("\n")}\n})`
		);

		it("imports the scalar parser for positional-only bodies", () => {
			expect(imports(ctx).render().join("\n")).toContain("parseScalarValue");
		});

		it.each([false, true])(
			"preserves scalar types with positionals, files, and --body (dry run: %s)",
			async (dryRun) => {
				await seed({ "scalar value.json": "0.25" });
				for (const [args, expected] of [
					[["1000"], { threshold: 1000 }],
					[["veto"], { threshold: "veto" }],
					[["@scalar value.json"], { threshold: 0.25 }],
					[["1000", "--body", "{}"], { threshold: 1000 }],
					[
						["veto", "--body", '{"label":"raw"}'],
						{ threshold: "veto", label: "raw" },
					],
					[
						["@scalar value.json", "--body", '{"threshold":0.25}'],
						{ threshold: 0.25 },
					],
					[["--body", '{"threshold":false}'], { threshold: false }],
				] as const) {
					const send = vi.fn(async () => undefined);
					const requestApi = vi.fn(async () => undefined);
					const formatDryRun = vi.fn();
					const run = new Script(source).runInNewContext({
						compactBody,
						mergeBodyPositionals,
						parseBody,
						parseScalarValue,
						formatDryRun,
						createCommandClient: async () => ({ send }),
						operation: {},
						requestApi,
						withProgress: async (
							_label: string,
							task: () => Promise<unknown>
						) => task(),
						formatOutput: () => {},
					}) as (argv: Record<string, unknown>) => Promise<void>;
					const argv = await yargs([
						"create",
						...args,
						...(dryRun ? ["--dry-run"] : []),
					])
						.exitProcess(false)
						.command(command, "", builder, () => {})
						.strict()
						.fail((message, error) => {
							throw error ?? new Error(message);
						})
						.parseAsync();
					await run(argv);
					if (dryRun) {
						expect(formatDryRun).toHaveBeenCalledWith(
							expect.objectContaining({ body: expected })
						);
						expect(send).not.toHaveBeenCalled();
						expect(requestApi).not.toHaveBeenCalled();
					} else if (typed) {
						expect(send).toHaveBeenCalledWith({}, { body: expected });
						expect(requestApi).not.toHaveBeenCalled();
					} else {
						expect(requestApi).toHaveBeenCalledWith(
							expect.anything(),
							"POST",
							"/things",
							{ body: expected }
						);
						expect(send).not.toHaveBeenCalled();
					}
				}
			}
		);
	}
);
