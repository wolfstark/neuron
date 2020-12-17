// 注册自定义协议
const { app, dialog } = require("electron");
const path = require("path");
const agreement = "neuron"; // 自定义协议名
// 验证是否为自定义协议的链接
const AGREEMENT_REGEXP = new RegExp(`^${agreement}://`);

// 监听自定义协议唤起
function watchProtocol() {
	// mac唤醒应用 会激活open-url事件 在open-url中判断是否为自定义协议打开事件
	app.on("open-url", (event, url) => {
		const isProtocol = AGREEMENT_REGEXP.test(url);
		if (isProtocol) {
			console.log("获取协议链接, 根据参数做各种事情");
			dialog.showMessageBox({
				type: "info",
				message: "Mac protocol 自定义协议打开",
				detail: `自定义协议链接:${url}`,
			});
		}
	});
	// window系统下唤醒应用会激活second-instance事件 它在ready执行之后才能被监听
	app.on("second-instance", (event, commandLine) => {
		// commandLine 是一个数组， 唤醒的链接作为数组的一个元素放在这里面
		commandLine.forEach((str) => {
			if (AGREEMENT_REGEXP.test(str)) {
				console.log("获取协议链接, 根据参数做各种事情");
				dialog.showMessageBox({
					type: "info",
					message: "window protocol 自定义协议打开",
					detail: `自定义协议链接:${str}`,
				});
			}
		});
	});
}

function setDefaultProtocol() {
	let isSet = false; // 是否注册成功

	app.removeAsDefaultProtocolClient(agreement); // 每次运行都删除自定义协议 然后再重新注册
	// 开发模式下在window运行需要做兼容
	if (process.env.NODE_ENV === "development" && process.platform === "win32") {
		// 设置electron.exe 和 app的路径
		isSet = app.setAsDefaultProtocolClient(agreement, process.execPath, [
			path.resolve(process.argv[1]),
		]);
	} else {
		isSet = app.setAsDefaultProtocolClient(agreement);
	}
	console.log("是否注册成功", isSet);
	if (isSet) watchProtocol();
}

module.exports = {
	watchProtocol,
	setDefaultProtocol,
};
