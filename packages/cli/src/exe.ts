import { CliExit, main } from "./index.js";

try {
	await main();
} catch (error) {
	process.exit(error instanceof CliExit ? error.code : 1);
}
