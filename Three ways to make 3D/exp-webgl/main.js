//Enhance THREE.Matrix4 with flatten method
 THREE.Matrix4.prototype.flatten = function() {
	return [this.n11, this.n21, this.n31, this.n41,
			this.n12, this.n22, this.n32, this.n42,
			this.n13, this.n23, this.n33, this.n43,
			this.n14, this.n24, this.n34, this.n44];
 };
 
 
 var gl;
  function initGL(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }
  }


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  var shaderProgram;
  function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "color");
	shaderProgram.scaleUniform = gl.getUniformLocation(shaderProgram, "scale");

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  }


  var mvMatrix;

  function loadIdentity() {
    mvMatrix = new THREE.Matrix4;
  }

  function multMatrix(m) {
    mvMatrix.multiplySelf(m);
  }

  function mvTranslate(v) {
    var m = THREE.Matrix4.translationMatrix(v[0], v[1], v[2]);
    multMatrix(m);
  }

  function mvRotateX(rx) {
    var m = THREE.Matrix4.rotationXMatrix(rx);
    multMatrix(m);
  }

  function mvRotateY(ry) {
    var m = THREE.Matrix4.rotationYMatrix(ry);
    multMatrix(m);
  }

  var pMatrix;
  function perspective(fovy, aspect, znear, zfar) {
    pMatrix = THREE.Matrix4.makePerspective(fovy, aspect, znear, zfar);
  }


  function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  var ballsPositionBuffer;
  function initBuffers() {
    ballsPositionBuffer = gl.createBuffer();
    ballsPositionBuffer.itemSize = 3;
    ballsPositionBuffer.numItems = parts.length;
  }


  function initWebGL() {
	var canvas = document.getElementById("viz");
    initGL(canvas);

    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
	gl.enable(gl.POINT_SMOOTH);
	gl.enable(gl.BLEND);
  }
  

var rx = Math.PI/4, 
	ry = Math.PI/4, 
	r = 180,
	g = 10,
	b = 10,
	shape = 0,
	parts = [],
    s = 60,
	first = true,
	shapes = [
			  'MengerSponge', 
			  'Sphere', 
			  'Sierpinski'
			  ];

function load() {
	init();
	initWebGL();
	setInterval(loop, 1000/60);
}

function init() {
	//create shapes
	Shape.MengerSponge(parts, {
		itr: 3,
		s: s
	});
	Shape.Sphere(parts, {
		s: s/1.1
	});
	Shape.Sierpinski(parts, {
		itr: 6,
		s: s/2
	});
	//set tween options
	tween.set({
		loops: 180,
		loopsDelay: 0,
		transition: Trans.Elastic.easeOut,
		compute: function(delta) {
			for(var i=0, l=parts.length; i<l; i++) {
				var p = parts[i],
					begin = p.begin || { x:0, y:0, z:0 },
					end = p.end || { x:0, y:0, z:0 };
				p.pos = {
					x: begin.x + (end.x - begin.x) * delta,
					y: begin.y + (end.y - begin.y) * delta,
					z: begin.z + (end.z - begin.z) * delta
				};
			}
		},
		complete: function() {
			nextShape();
		}
	});
	for(var i=0, l=parts.length; i<l; i++) {
		var p = parts[i];
		p.pos = new THREE.Vector4();
	}	
	nextShape();
}

function nextShape() {
	for(var i=0, l=parts.length; i<l; i++) {
		var p = parts[i];
		p.begin = p.pos;
		p.end = p[shapes[shape].toLowerCase()];
	}
	shape = (shape + 1) % shapes.length;
	tween.set({
		loop: 0,
        loopsDelay: first? 0 : 80
	});
	first = false;
}

function loop() {
	tween.step();
	rx += 0.03;
	ry += 0.01;
	r = (180 + 40 * (Math.sin(ry))) / 255;
	g = (10 + 100 * (1 - Math.sin(rx))) / 255;
	b = (10 + 100 * (1 - Math.cos(ry))) / 255;
        
	gl.uniform1f(shaderProgram.scaleUniform, s);
	gl.uniform3f(shaderProgram.colorUniform, r, g, b);

	//draw scene
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0);
    loadIdentity();
	mvTranslate([0.0, 0.0, -150.0]);
	mvRotateX(rx);
	mvRotateY(ry);
	for(var i=0, l=parts.length, vertices=[]; i<l; i++) {
		var p = parts[i].pos;
		vertices.push(p.x, p.y, p.z);
	}
	//create and store and bind vertex data
	gl.bindBuffer(gl.ARRAY_BUFFER, ballsPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ballsPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.POINTS, 0, ballsPositionBuffer.numItems);
}