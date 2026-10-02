import { relative } from "node:path";
import type { TestModule } from "vitest/node";
import type { Reporter } from "vitest/reporters";

/** Collection imports only; external packages' internal imports are omitted. */
export default class ImportReporter implements Reporter {
	onTestModuleEnd(testModule: TestModule): void {
		const diagnostic = testModule.diagnostic();
		const imports = Object.entries(diagnostic.importDurations);
		const sdkImports = imports.filter(([id]) =>
			id.replaceAll("\\", "/").includes("/src/sdk/")
		);
		console.log(
			`\n${testModule.relativeModuleId}: ${imports.length} tracked collection imports ` +
				`(${sdkImports.length} SDK), ${Math.round(diagnostic.collectDuration)}ms collection, ` +
				`${Math.round(diagnostic.duration)}ms tests`
		);
		for (const [id, duration] of imports
			.sort(([, a], [, b]) => b.totalTime - a.totalTime)
			.slice(0, 5)) {
			console.log(
				`  ${Math.round(duration.totalTime)}ms total / ${Math.round(duration.selfTime)}ms self: ${relative(process.cwd(), id)}`
			);
		}
	}
}
