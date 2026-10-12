import { withTelemetry } from "../../../lib/telemetry/index.js";
import deployCommand from "../deploy.js";

export default withTelemetry(deployCommand, {
	command: "previews deploy",
	classification: { safeFlags: ["prebuilt"] },
});
