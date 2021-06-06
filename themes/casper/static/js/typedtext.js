var speed = 80;
var target = [$("#quote"), $("#handle")];
var target_idx = 0;
var content = [$("#quote").text(), $("#handle").text()];
var content_idx = 0;

function init() {
	for (var i = 0; i < target.length; i++) {
		target[i].text("");
	}
}

function typewriter() {
	var display_content = String(content[target_idx]).substring(0, content_idx);

	if (content_idx == content[target_idx].length) {
		target[target_idx++].text(display_content);
		if (target_idx == target.length) {
			return;
		}
		content_idx = 0;
	} else {
		target[target_idx].text(display_content + "_");
		content_idx++;
	}
	setTimeout("typewriter()", speed);
}

init();

typewriter();