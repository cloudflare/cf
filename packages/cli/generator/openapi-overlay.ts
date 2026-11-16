import { bundleFromString, createConfig, lint } from "@redocly/openapi-core";
import type { ForgeOpenApiDocument } from "./openapi.js";
import type { NormalizedProblem } from "@redocly/openapi-core";

export async function applyOpenApiOverlay(
	openapi: ForgeOpenApiDocument,
	overlayPath: string
): Promise<ForgeOpenApiDocument> {
	const config = await createConfig({ rules: { struct: "error" } });
	assertNoErrors(await lint({ ref: overlayPath, config }));
	const result = await bundleFromString({
		source: JSON.stringify(openapi),
		config,
		overlays: [overlayPath],
	});
	assertNoErrors(result.problems);
	return result.bundle.parsed as ForgeOpenApiDocument;
}

function assertNoErrors(problems: NormalizedProblem[]): void {
	const errors = problems.filter((problem) => problem.severity === "error");
	if (errors.length > 0) {
		throw new Error(
			errors
				.map(({ message, location }) => {
					const at = location[0];
					return `${at?.source.absoluteRef ?? "OpenAPI overlay"}${at?.pointer ?? ""}: ${message}`;
				})
				.join("\n")
		);
	}
}
