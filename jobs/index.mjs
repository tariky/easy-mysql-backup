import config from "../config.mjs";
import { exec } from "child_process";
import { nanoid } from "nanoid";
import fsExtra from "fs-extra";
import figlet from "figlet";
import AdmZip from "adm-zip";
import util from "node:util";
import ora from "ora";
import dayjs from "dayjs";
import FormData from "form-data";
import axios from "axios";

const promisedExec = util.promisify(exec);

const log = console.log;
const { databases, dbUser } = config;

function checkIfSnapshotsDirExist() {
	if (fsExtra.existsSync("snapshots")) {
		return;
	} else {
		fsExtra.mkdirSync("snapshots");
	}
}
checkIfSnapshotsDirExist();

async function renderArt() {
	await new Promise((resolve, reject) => {
		console.clear();
		figlet("EMdB", function (err, data) {
			if (err) {
				reject("Something went wrong...");
				return;
			}
			resolve(log(data));
		});
	});
}

async function dumpAllDatabases() {
	const promiseArray = databases.map(async (database) => {
		const dbSpinner = ora("Backing up database...").start();
		const { stderr, stdout } = await promisedExec(
			`mysqldump --defaults-extra-file=./mysql-config.cnf -u ${dbUser} ${database} > snapshots/snapshot-${database}-${nanoid(
				6
			)}.sql`
		);
		if (stderr) {
			console.log(stderr);
			console.log(stdout);
		}
		dbSpinner.stopAndPersist({
			text: `Backup completed - Database: ${database}`,
			symbol: "✅",
		});
	});
	await Promise.all(promiseArray);
}

async function zipFiles() {
	const zipSpinner = ora("Zipping all snapshots...").start();
	return await new Promise((resolve, reject) => {
		const zip = new AdmZip();
		const fileName = `snapshots-${dayjs().format("YY-MM-DD")}.zip`;
		zip.addLocalFolder("./snapshots");
		zip.writeZip(fileName, (err) => {
			if (err) {
				reject("There is something wrong with files zipping!");
			}
			resolve(fileName);
		});
		zipSpinner.stopAndPersist({ text: "Zip archive created", symbol: "🗄️" });
	});
}

async function deleteSnapshotFolder() {
	const deleteOra = ora("Deleting snapshots...").start();
	await new Promise((resolve, reject) => {
		fsExtra.emptyDir("./snapshots", () => {
			deleteOra.stopAndPersist({
				text: "All snapshots deleted",
				symbol: "🗑️",
			});
			resolve();
		});
	});
}

async function deleteSnapshotUploadFile(filename) {
	const deleteOra = ora("Deleting snapshot file...").start();
	await new Promise((resolve, reject) => {
		fsExtra.remove(`./${filename}`, () => {
			deleteOra.stopAndPersist({
				text: "Snapshot file deleted",
				symbol: "🗑️",
			});
			resolve();
		});
	});
}

async function transferBackupOffsite(filename) {
	const form = new FormData();

	// Append file to form
	form.append("transfer", fsExtra.createReadStream(`./${filename}`), {
		filename: filename,
		knownLength: fsExtra.statSync(`./${filename}`).size,
	});

	const upload = await axios.post(
		`http://${config.offSiteAddress}/api/reciever/${config.uploadToken}`,
		form,
		{ headers: form.getHeaders() }
	);

	const { status } = upload;

	if (status === 200) console.log("✈️ Uploaded to offsite location!");
}

await renderArt();
await dumpAllDatabases();
const snapshotFileName = await zipFiles();
await transferBackupOffsite(snapshotFileName);
await deleteSnapshotFolder();
await deleteSnapshotUploadFile(snapshotFileName);
