import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type Argv } from "yargs";
import { builderLines } from "../../../../generator/plugin/emit/builder.js";
import { handler, imports } from "../../../../generator/plugin/emit/handler.js";
import { context as emitContext } from "../../../../generator/plugin/emit/index.js";
import { compactBody, parseScalarValue } from "../../../lib/body-parser.js";
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
			"preserves numeric, sentinel, and file values (dry run: %s)",
			async (dryRun) => {
				await seed({ "scalar value.json": "0.25" });
				for (const [input, expected] of [
					["1000", 1000],
					["veto", "veto"],
					["@scalar value.json", 0.25],
				] as const) {
					const send = vi.fn(async () => undefined);
					const requestApi = vi.fn(async () => undefined);
					const formatDryRun = vi.fn();
					const run = new Script(source).runInNewContext({
						compactBody,
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
						input,
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
							expect.objectContaining({ body: { threshold: expected } })
						);
						expect(send).not.toHaveBeenCalled();
						expect(requestApi).not.toHaveBeenCalled();
					} else if (typed) {
						expect(send).toHaveBeenCalledWith(
							{},
							{ body: { threshold: expected } }
						);
						expect(requestApi).not.toHaveBeenCalled();
					} else {
						expect(requestApi).toHaveBeenCalledWith(
							expect.anything(),
							"POST",
							"/things",
							{ body: { threshold: expected } }
						);
						expect(send).not.toHaveBeenCalled();
					}
				}
			}
		);
	}
);
