window.addEventListener("load", initSystem, false);

var SystemRoot;
var PerceptronWindow;
var PerceptronApplication;

function
initSystem()
{
	SystemRoot = new ECMASystem(document.body);

	PerceptronWindow = SystemRoot.createWindow({id: "Perceptron", noCloseButton: null});
	PerceptronWindow.ECMASystemWindowFixed = true;
	PerceptronWindow.style.position = "absolute";
	PerceptronWindow.style.top = "0px";
	PerceptronWindow.style.left = "0px";
	PerceptronWindow.style.width = "100%";
	PerceptronWindow.style.height = "100%";
	PerceptronWindow.style.padding = "0";
	PerceptronWindow.style.outline = "0";
	PerceptronWindow.style.border = "0";
	PerceptronWindow.style.backgroundColor = "rgba(20, 20, 20, 0.5)";
	document.body.appendChild(PerceptronWindow);
	SystemRoot.windowScroller.style.display = "none";

	PerceptronApplication = new Perceptron(SystemRoot, PerceptronWindow);
}

