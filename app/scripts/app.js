const eNotify = require("../notify");

document.getElementById("btn").addEventListener("click", (e) => {
	let en = eNotify.notify({
		title: "Hello World",
		body: Math.random() * (100)
	});
});
