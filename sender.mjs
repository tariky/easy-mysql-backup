import Bree from "bree";
import Cabin from "cabin";
import Graceful from "@ladjs/graceful";
import config from "./config.mjs";

const bree = new Bree({
	logger: new Cabin(),
	jobs: [
		{
			name: "beep",
			path: "./jobs/index.mjs",
			interval: config.breeInterval,
		},
	],
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

(async () => {
	await bree.start();
})();
