// The code written in BSD/KNF indent style
"use strict";

class Perceptron {
	constructor(windowSystemRoot, rootWindow)
	{
		// Core variables
		this.SysRoot = windowSystemRoot;
		this.rootWindow = rootWindow;
		this.rootWindow.style.overflow = "hidden";
		this.rootWindow.rootInstance = this;
		this.rootWindowStyle = window.getComputedStyle(this.rootWindow);
		// HTML elements
		this.trainButton = null;
		this.timeCounter = null;
		this.timeCounterLabel = null;
		this.dataNum = null;
		this.dataNumLabel = null;
		this.inputNum = null;
		this.inputNumLabel = null;
		this.parameterDispBox = null;
		this.weight0Disp = null;
		this.weight1Disp = null;
		this.biasDisp = null;
		this.screen = null;
		this.canvas = null;
		this.console = null;
		// Canvas
		this.context = null;
		this.canvasSize = {width: 600, height: 600};
		this.canvasOffset = {top: 120, left: 70};
		this.plotOffset = {x: this.canvasSize.width / 2, y: this.canvasSize.height / 2};
		this.plotScale = 200.0;
		// Perceptron parameters
		this.perceptron = {
			inputDim: 2,
			outputDim: 2,
			w: [],
			b: [],
			normalizeW: false,
			trainEnabled: false};
		// data
		this.data = [];
		this.input = []; // data which is not used for training
		// loop instance
		this.loopInterval = null;

		// Initialize
		this.init();
	}

	// ----- Initialize -----
	init()
	{
		// Create UI parts
		this.prepareTools();

		// Initialize
		this.initField();
		this.initPerceptron();

		// Start loop
		if (this.loopInterval == null) {
			let root = this;
			this.loopInterval = setInterval(function () { root.loop(); }, 25);
		}

		// Set random data
		this.addRandomTrainingData();
	}

	reinit()
	{
		this.console.write("Reset");
		// Initialize
		this.initField();
		this.initPerceptron();

		// Set random data
		this.addRandomTrainingData();
	}

	prepareTools()
	{
		this.trainButton = document.createElement("div");
		this.trainButton.rootInstance = this;
		this.trainButton.innerHTML = "train";
		this.trainButton.id = "PerceptronTrainButton";
		this.trainButton.addEventListener("mousedown", function (e) { e.preventDefault(); e.currentTarget.rootInstance.trainEnable(e); }, false);
		this.trainButton.addEventListener("touchstart", function (e) { e.preventDefault(); e.currentTarget.rootInstance.trainEnable(e); }, false);
		this.rootWindow.appendChild(this.trainButton);

		this.resetButton = document.createElement("div");
		this.resetButton.rootInstance = this;
		this.resetButton.innerHTML = "reset";
		this.resetButton.id = "PerceptronResetButton";
		this.resetButton.addEventListener("mousedown", function (e) { e.preventDefault(); e.currentTarget.rootInstance.reinit(e); }, false);
		this.resetButton.addEventListener("touchstart", function (e) { e.preventDefault(); e.currentTarget.rootInstance.reinit(e); }, false);
		this.rootWindow.appendChild(this.resetButton);

		this.timeCounter = document.createElement("div");
		this.timeCounter.innerHTML = "0";
		this.timeCounter.id = "PerceptronTimeCounter";
		this.rootWindow.appendChild(this.timeCounter);
		this.timeCounter.addEventListener("mousedown", (e) => console.log(this), false);

		this.timeCounterLabel = document.createElement("div");
		this.timeCounterLabel.innerHTML = "time";
		this.timeCounterLabel.id = "PerceptronTimeCounterLabel";
		this.rootWindow.appendChild(this.timeCounterLabel);

		this.trainDataNumLabel = document.createElement("div");
		this.trainDataNumLabel.innerHTML = "training data";
		this.trainDataNumLabel.id = "PerceptronTrainDataNumLabel";
		this.rootWindow.appendChild(this.trainDataNumLabel);

		this.trainDataNum = document.createElement("div");
		this.trainDataNum.rootInstance = this;
		this.trainDataNum.id = "PerceptronTrainDataNum";
		this.rootWindow.appendChild(this.trainDataNum);

		this.inputDataNumLabel = document.createElement("div");
		this.inputDataNumLabel.innerHTML = "input";
		this.inputDataNumLabel.id = "PerceptronInputDataNumLabel";
		this.rootWindow.appendChild(this.inputDataNumLabel);

		this.inputDataNum = document.createElement("div");
		this.inputDataNum.rootInstance = this;
		this.inputDataNum.id = "PerceptronInputDataNum";
		this.rootWindow.appendChild(this.inputDataNum);

		// Parameter Display
		this.parameterDispBox = document.createElement("div");
		this.parameterDispBox.id = "PerceptronParameterDispBox";
		this.rootWindow.appendChild(this.parameterDispBox);

		// weight[0]
		this.weight0Label = document.createElement("div");
		this.weight0Label.className = "PerceptronParameterLabel";
		this.weight0Label.id = "PerceptronWeight0Label";
		this.weight0Label.innerHTML = "w0";
		this.parameterDispBox.appendChild(this.weight0Label);

		this.weight0Disp = document.createElement("div");
		this.weight0Disp.className = "PerceptronParameterDisp";
		this.weight0Disp.id = "PerceptronWeight0Disp";
		this.parameterDispBox.appendChild(this.weight0Disp);

		// weight[1]
		this.weight1Label = document.createElement("div");
		this.weight1Label.className = "PerceptronParameterLabel";
		this.weight1Label.id = "PerceptronWeight1Label";
		this.weight1Label.innerHTML = "w1";
		this.parameterDispBox.appendChild(this.weight1Label);

		this.weight1Disp = document.createElement("div");
		this.weight1Disp.className = "PerceptronParameterDisp";
		this.weight1Disp.id = "PerceptronWeight1Disp";
		this.parameterDispBox.appendChild(this.weight1Disp);

		// bias
		this.biasLabel = document.createElement("div");
		this.biasLabel.className = "PerceptronParameterLabel";
		this.biasLabel.id = "PerceptronBiasLabel";
		this.biasLabel.innerHTML = "b";
		this.parameterDispBox.appendChild(this.biasLabel);

		this.biasDisp = document.createElement("div");
		this.biasDisp.className = "PerceptronParameterDisp";
		this.biasDisp.id = "PerceptronBiasDisp";
		this.parameterDispBox.appendChild(this.biasDisp);

		// Init console
		this.console = new Console(this.screen);
		this.screen = this.console.getElement();
		this.screen.id = "PerceptronConsole";
		this.rootWindow.appendChild(this.screen);

		this.prepareCanvas();
	}

	prepareCanvas()
	{
		this.canvas = document.createElement("canvas");
		this.canvas.rootInstance = this;
		this.canvas.id = "PerceptronCanvas";
		this.canvas.style.width = this.canvasSize.width + "px";
		this.canvas.style.height = this.canvasSize.height + "px";
		this.canvas.width = this.canvasSize.width;
		this.canvas.height = this.canvasSize.height;
		this.canvas.style.position = "absolute";
		this.canvas.style.top = this.canvasOffset.top + "px";
		this.canvas.style.left = this.canvasOffset.left + "px";
		this.canvas.addEventListener(
		    "windowdrag",
		    function (e) {
			    let style = window.getComputedStyle(e.currentTarget);
			    e.currentTarget.width = parseInt(style.width, 10);
			    e.currentTarget.height = parseInt(style.height, 10);
			    let root = e.currentTarget.rootInstance;
			    root.displayOffset.x = e.currentTarget.width / 2.0;
			    root.displayOffset.y = e.currentTarget.height / 2.0;
		    }, false);
		this.context = this.canvas.getContext("2d");
		this.canvas.addEventListener("mousedown", function (e) { e.currentTarget.rootInstance.canvasMouseClick(e); }, false);
		this.canvas.addEventListener("mousemove", function (e) { e.currentTarget.rootInstance.canvasMouseMove(e); }, false);
		this.canvas.addEventListener("touchstart", function (e) { e.currentTarget.rootInstance.canvasMouseClick(e); }, false);
		this.canvas.addEventListener("touchmove", function (e) { e.currentTarget.rootInstance.canvasMouseMove(e); }, false);
		this.rootWindow.appendChild(this.canvas);
	}

	initField()
	{
		// data used for training and input is just for evaluation
		this.data = [];
		this.input = [];
	}

	initPerceptron()
	{
		// weight
		this.perceptron.w = new Array2D(this.perceptron.inputDim, this.perceptron.outputDim);
		for (let n = 0; n < this.perceptron.w.length; n++) {
			this.perceptron.w[n] = Math.random();
		}
		// bias
		this.perceptron.b = new Array(this.perceptron.outputDim);
		for (let n = 0; n < this.perceptron.b.length; n++) {
			this.perceptron.b[n] = Math.random();
		}
	}

	// Main loop
	loop()
	{
		if (this.perceptron.trainEnabled) {
			this.train();
		}
		this.draw();
	}

	trainEnable(e)
	{
		this.perceptron.trainEnabled = this.perceptron.trainEnabled ? false : true;
		if (this.perceptron.trainEnabled) {
			this.console.write("Training start");
		} else {
			this.console.write("Training stop");
		}
	}


	// ----- Perceptron -----
	addRandomTrainingData()
	{
		let coeff = 1.0;
		let v_x = (Math.random() - 0.5);
		let v_y = (Math.random() - 0.5);
		let v_n = Math.sqrt(v_x * v_x + v_y * v_y);
		v_x /= v_n;
		v_y /= v_n;
		let w_x = (Math.random() - 0.5);
		let w_y = (Math.random() - 0.5);
		let w_n = Math.sqrt(w_x * w_x + w_y * w_y);
		w_x /= w_n;
		w_y /= w_n;
		for (let i = 0; i < 60; i++) {
			let x = (Math.random() - 0.5) * coeff;
			let y = (Math.random() - 0.5) * coeff;
			try {
				if (Math.random() - 0.5 > 0) {
					this.addTrainingData([x + v_x, y + v_y], 0);
				} else {
					this.addTrainingData([x + w_x, y + w_y], 1);
				}
			} catch (e) {
				console.log(e.name(), e.message());
			}
		}
		this.console.write("Add random data");
	}

	addTrainingData(v, c)
	{
		if (v.length != this.perceptron.inputDim) {
			throw new RangeError("Bad length of data");
		}
		this.data.push({v: v, c: c}); // x (n-dim vector), class
	}

	train()
	{
		let lr = 0.01; // learning rate
		// Init temporary buffer
		let w_d = new Array2D(this.perceptron.inputDim, this.perceptron.outputDim);
		let b_d = new Array(this.perceptron.outputDim);
		for (let i = 0; i < w_d.length; i++) {
			w_d[i] = 0;
		}
		for (let i = 0; i < b_d.length; i++) {
			b_d[i] = 0;
		}
		// Training
		for (let n = 0; n < this.data.length; n++) {
			let u = [0, 0];
			let output = [0, 0];
			for (let i = 0; i < this.perceptron.outputDim; i++) {
				for (let j = 0; j < this.perceptron.inputDim; j++) {
					// Array2D get(x, y) transpose of matrix like array
					u[i] += this.perceptron.w.get(j, i) * this.data[n].v[j];
				}
				output[i] = 1.0 / (1.0 + Math.exp(-(u[i] + this.perceptron.b[i])));
			}
			// class[1] in output[0] and class[-1] in output[1]
			let ans = new Array(this.perceptron.outputDim);
			for (let i = 0; i < this.perceptron.outputDim; i++) {
				if (i == this.data[n].c) {
					ans[i] = 1;
				} else {
					ans[i] = 0;
				}
			}
			// Update weights
			for (let i = 0; i < this.perceptron.outputDim; i++) {
				let d = ans[i] - output[i];
				for (let j = 0; j < this.perceptron.inputDim; j++) {
					// Update weights
					w_d.set(j, i,
						w_d.get(j, i) +
						lr * d * this.data[n].v[j]);
				}
				b_d[i] += lr * d; // Update bias
			}
		}
		// Set new weights and bias
		let sum = 0;
		for (let i = 0; i < w_d.length; i++) {
			this.perceptron.w[i] += w_d[i];
			sum += Math.pow(this.perceptron.w[i], 2);
		}
		if (this.perceptron.normalizeW) {
			let norm = Math.sqrt(sum);
			for (let i = 0; i < w_d.length; i++) {
				this.perceptron.w[i] /= norm;
			}
		}
		for (let i = 0; i < b_d.length; i++) {
			this.perceptron.b[i] += b_d[i];
		}
		this.parameterDisp();
	}

	parameterDisp()
	{
		this.weight0Disp.innerHTML = this.perceptron.w.get(0, 0);
		this.weight1Disp.innerHTML = this.perceptron.w.get(1, 0);
		this.biasDisp.innerHTML = this.perceptron.b[0];
	}


	// Plotting
	draw()
	{
		let drawArea = {left: 0, right: this.canvas.width, top: 0, bottom: this.canvas.height};
		//this.viewModified();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw cartesian axes
		this.context.lineWidth = 1;
		this.context.strokeStyle = "rgb(130, 130, 130)";
		this.context.beginPath();
		this.context.moveTo(this.plotOffset.x, 0);
		this.context.lineTo(this.plotOffset.x, this.canvas.height);
		this.context.moveTo(0, this.plotOffset.y);
		this.context.lineTo(this.canvas.width, this.plotOffset.y);
		this.context.stroke();

		// Draw w
		this.context.strokeStyle = "rgb(255, 255, 0)";
		this.context.beginPath();
		this.context.moveTo(this.plotOffset.x, this.plotOffset.y);
		this.context.lineTo(
		    this.plotOffset.x + 10 * this.plotScale * this.perceptron.w.get(0, 0),
		    this.plotOffset.y - 10 * this.plotScale * this.perceptron.w.get(1, 0));
		this.context.stroke();

		// Draw g(x) == 0
		let norm = Math.sqrt(Math.pow(this.perceptron.w.get(0, 0), 2) +
			Math.pow(this.perceptron.w.get(1, 0), 2));
		let v_zero = [
			-this.perceptron.b[0] * this.perceptron.w.get(0, 0) / norm / norm,
			-this.perceptron.b[0] * this.perceptron.w.get(1, 0) / norm / norm];
		let v_norm = [-this.perceptron.w.get(1, 0) / norm, this.perceptron.w.get(0, 0) / norm];
		this.context.strokeStyle = "rgb(0, 0, 255)";
		this.context.beginPath();
		this.context.moveTo(
		    this.plotOffset.x + (v_zero[0] + 200 * v_norm[0]) * this.plotScale,
		    this.plotOffset.y + -(v_zero[1] + 200 * v_norm[1]) * this.plotScale);
		this.context.lineTo(
		    this.plotOffset.x + (v_zero[0] - 200 * v_norm[0]) * this.plotScale,
		    this.plotOffset.y + -(v_zero[1] - 200 * v_norm[1]) * this.plotScale);
		this.context.stroke();

		// Plot data
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i].c == 0) {
				this.context.strokeStyle = "rgb(255, 0, 0)";
			} else {
				this.context.strokeStyle = "rgb(0, 255, 0)";
			}
			this.context.beginPath();
			this.context.arc(
			    this.plotOffset.x + this.plotScale * this.data[i].v[0],
			    this.plotOffset.y - this.plotScale * this.data[i].v[1],
			    1, 0, 2 * Math.PI, false);
			this.context.stroke();
		}
		for (let i = 0; i < this.input.length; i++) {
			this.context.strokeStyle = "rgb(0, 0, 255)";
			this.context.beginPath();
			this.context.arc(
			    this.plotOffset.x + this.plotScale * this.input[i].v[0],
			    this.plotOffset.y - this.plotScale * this.input[i].v[1],
			    1, 0, 2 * Math.PI, false);
			this.context.stroke();
		}
	}

	viewModified()
	{
		let newWindowSize = {x: parseInt(this.rootWindowStyle.width, 10), y: parseInt(this.rootWindowStyle.height, 10)};
		if (this.canvas.width != newWindowSize.x ||
		    this.canvas.height != newWindowSize.y) {
			this.canvas.width = newWindowSize.x;
			this.canvas.height = newWindowSize.y;
			this.displayOffset.x = newWindowSize.x / 2;
			this.displayOffset.y = newWindowSize.y / 2;
		}
	}


	// Event
	canvasMouseClick(e)
	{
	}

	canvasMouseMove(e)
	{
	}
}

