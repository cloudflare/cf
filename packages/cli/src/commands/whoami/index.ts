import { withTelemetry } from "../../lib/telemetry/index.js";
import whoamiCommand from "../auth/whoami.js";

export default withTelemetry(
	{ ...whoamiCommand, describe: false },
	{ command: "whoami", classification: { safeFlags: ["json"] } }
);
