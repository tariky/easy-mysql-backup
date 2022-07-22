import express from "express";
import multer from "multer";
import mime from "mime-types";
import fs from "fs-extra";
import config from "./config.mjs";

// Define app
const app = express();

// Configure storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads");
	},
	filename: function (req, file, cb) {
		// Extract file extansion
		const mimetype = mime.extension(file.mimetype);

		// Generate random number
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${file.fieldname}-${uniqueSuffix}.${mimetype}`);
	},
});

// Init upload engine
const upload = multer({ storage: storage });

// Make sure that uploads folder exists before trying to upload to it
const checkIfUploadDirExits = () => {
	if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test", async (req, res) => {
	res.json({
		msg: "Reciever is working!",
	});
});

app.post(
	"/api/reciever/:token",
	(req, res, next) => {
		const token = req.params.token;
		if (token === config.uploadToken) {
			checkIfUploadDirExits();
			next();
		} else {
			res.json({ msg: "Token is not valid" });
		}
	},
	upload.single("transfer"),
	async (req, res) => {
		res.json({ msg: "File uploaded" });
	}
);

const PORT = 5000;

app.listen(PORT, () => {
	console.log(`Reciver server is working on port: ${PORT}`);
});
