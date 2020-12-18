const express = require("express");
const cors = require("cors");
const { createWindow } = require("./window");
const ogs = require("open-graph-scraper");

const port = 3777; // TODO: 提供备用端口
const app = express();
// TODO: 创建app延后执行

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/addHtml", (req, res) => {
	console.log(
		"🚀 ~ file: server.js ~ line 19 ~ app.post ~ req.params.htmlStr",
		req.body.htmlStr
	);
	const win = createWindow();

	win.webContents.send("extension-html", req.body.htmlStr);

	ogs({ url: req.body.url }).then((data) => {
		// TODO: 对于没添加过的网站去爬取内容
		const { error, result, response } = data;
		console.log("error:", error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
		console.log("result:", result); // This contains all of the Open Graph results
		// console.log("response:", response); // This contains the HTML of page
	});

	res.json({ code: 0 });
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
