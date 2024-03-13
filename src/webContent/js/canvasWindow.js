$(function () {
	$(".canvas-window .how-to-exit-message").fadeOut(2000);

	const paintCanvas = document.querySelector("#canvas-window-canvas");
	paintCanvas.width = document.body.clientWidth;
	paintCanvas.height = document.body.clientHeight;

	const context = paintCanvas.getContext("2d");

	window.addEventListener("keyup", function (e) {
		if (e.key == "Escape") {
			context.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
			app.exitDrawMode();
		}
	});

	context.lineCap = "round";
	context.strokeStyle = "red";
	context.lineWidth = 5;

	let x = 0,
		y = 0;
	let isMouseDown = false;

	const stopDrawing = () => {
		isMouseDown = false;
	};
	const startDrawing = (event) => {
		isMouseDown = true;
		[x, y] = [event.offsetX, event.offsetY];
	};
	const drawLine = (event) => {
		if (isMouseDown) {
			const newX = event.offsetX;
			const newY = event.offsetY;
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(newX, newY);
			context.stroke();
			//[x, y] = [newX, newY];
			x = newX;
			y = newY;
		}
	};

	paintCanvas.addEventListener("mousedown", startDrawing);
	paintCanvas.addEventListener("mousemove", drawLine);
	paintCanvas.addEventListener("mouseup", stopDrawing);
	paintCanvas.addEventListener("mouseout", stopDrawing);
});
