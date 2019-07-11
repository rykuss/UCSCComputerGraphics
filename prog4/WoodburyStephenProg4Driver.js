//*******************************************************************************************************
//                                          SHADERS
//*******************************************************************************************************
// Vertex shader
var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +                  //Creating an attrib vec4 var named a_Position
	'varying vec4 v_Position;\n' +
	'attribute vec2 a_TexCoord;\n' +
	'varying vec2 v_TexCoord;\n' +
	'attribute vec4 a_Color;\n' +                     //Creating an attrib vec4 var named a_Color
	'varying vec4 v_Color;\n' +
	'attribute vec4 a_Normal;\n' +
	'varying vec4 v_Normal;\n' +
	'attribute vec4 fV_Position;\n' +
	'varying vec4 f_Position;\n' +
	'uniform mat4 u_xformMatrix;\n' +
	'uniform mat4 u_rformMatrix;\n' +
	'uniform mat4 u_ProjMatrix;\n' +                  //Creating a uniform mat4 var named u_ProjMatrix
	'void main() {\n' +                               //our main function start
	'  vec4 middle;\n' +
	'  middle = u_xformMatrix * a_Position;\n' +
	'  gl_Position = u_ProjMatrix * middle;\n' +
	'  v_Color = a_Color;\n' +
	'  v_TexCoord = a_TexCoord;\n' +
	'  v_Normal = u_rformMatrix * a_Normal;\n' +
	'  v_Position = a_Position;\n' +
	'  f_Position = u_xformMatrix * fV_Position;\n' +
	'}\n';

// Fragment shader program
var FSHADER_SOURCE =
	'#ifdef GL_ES\n' +                                //if GL_ES not defined
	'precision mediump float;\n' +                    //define precision?
	'#endif\n' +   
	'varying vec4 v_Position;\n' +
	'varying vec4 v_Color;\n' +
	'varying vec4 v_Normal;\n' +
	'varying vec4 f_Position;\n' +
	'uniform vec3 KS;\n' +
	'uniform vec3 KD;\n' +
	'uniform vec3 KA;\n' +
	'uniform float NS;\n' +
	'uniform float sPDraw;\n' +
	'uniform float lODraw;\n' +
	'uniform float lS1;\n' +
	'uniform float lS2;\n' +
	'uniform float specularOO;\n' +
	'uniform float ambientOO;\n' +
	'uniform float viewX;\n' + 
	'uniform float viewY;\n' + 
	'uniform float viewZ;\n' + 
	'uniform float projChoice;\n' +
	'vec4 Is1;\n' +
	'vec4 Id1;\n' +
	'vec4 Is2;\n' +
	'vec4 Id2;\n' +
	'vec4 amb;\n' +
	'vec4 vC;\n' +
	'const vec3 V = normalize(vec3(0.0, 0.0, 1.0));\n' +
	'uniform sampler2D u_Sampler;\n' +
	'varying vec2 v_TexCoord;\n' +
	'void main() {\n' +
	'if(sPDraw == 0.0) {\n' +
	'  if(lODraw == 1.0)\n' +
	'  {\n' +
    '    gl_FragColor = v_Color;\n' +
	'  }\n' +
	'  else {\n' +
    '    if(lS1 == 1.0) {\n' +
    '      vec3 L = normalize(vec3(1.0,1.0,1.0));\n' +
    '      vec3 N = normalize(v_Normal.xyz);\n' +
    '      float NdL = ((L.x*N.x)+(L.y*N.y)+(L.z*N.z));\n' +
    '      vec3 LC = vec3(1.0,1.0,1.0);\n' +
    '      vec3 KDLC = vec3(KD.x * LC.x, KD.y * LC.y, KD.z * LC.z);\n' +
    '      Id1 = vec4(KDLC.x*NdL, KDLC.y*NdL, KDLC.z*NdL, 0.0);\n' +
    '      Id1 = vec4(max(Id1.x, 0.0), max(Id1.y, 0.0), max(Id1.z, 0.0), 0.0);\n' +
    '      Id1 = vec4(min(Id1.x, 1.0), min(Id1.y, 1.0), min(Id1.z, 1.0), 0.0);\n' +
    '      if(specularOO == 1.0) {\n' +
    '        vec3 H;\n' +
    '        if(projChoice == 1.0)\n' +
    '		 {\n' +
    '          vec3 V = normalize(vec3((-1.0*viewX), (-1.0*viewY), (-1.0*viewZ)));\n' +
    '          vec3 LpV = normalize(vec3(V.x + L.x,V.y + L.y,V.z+L.z));\n' +
    '          H = normalize(LpV);\n' +
    '		 } else {\n' +
    '          vec3 V = normalize(vec3((-1.0*viewX), (-1.0*viewY), (-1.0*viewZ)));\n' +
    '          vec3 LpV = normalize(vec3(V.x + L.x,V.y + L.y,V.z+L.z));\n' +
    '          H = normalize(LpV);\n' +
    '        }\n' +
    '        float NdH = ((N.x*H.x)+(N.y*H.y)+(N.z*H.z));\n' +
    '        NdH = pow(NdH, NS);\n' +
    '        vec3 KSLC = vec3(KS.r*LC.r, KS.g*LC.g, KS.b*LC.b);\n' +
    '        Is1 = vec4((KSLC.x*NdH), (KSLC.y*NdH), (KSLC.z*NdH), 0.0);\n' +
    '        Is1 = vec4(max(min(Is1.x,1.0), 0.0), max(min(Is1.y,1.0), 0.0), max(min(Is1.z,1.0), 0.0), 0.0);\n' +
    '      } else {\n' +
    '        Is1 = vec4(0.0,0.0,0.0,0.0);\n' +
    '      }\n' +
    '    }\n' +
    '    else {\n' +
    '      Is1 = vec4(0.0,0.0,0.0,0.0);\n' +
    '      Id1 = vec4(0.0,0.0,0.0,0.0);\n' +
    '    }\n' +

    '    if(lS2 == 1.0) {\n' +
    '      vec3 N = normalize(v_Normal.xyz);\n' +
    '      vec3 L = normalize(vec3((0.0-f_Position.x), (500.0-f_Position.y), (0.0-f_Position.z)));\n' +
    '      float NdL = ((L.x*N.x)+(L.y*N.y)+(L.z*N.z));\n' +
    '      vec3 LC = vec3(1.0,1.0,0.0);\n' +
    '      vec3 KDLC = vec3(KD.x * LC.x, KD.y * LC.y, KD.z * LC.z);\n' +
    '      Id2 = vec4(KDLC.x*NdL, KDLC.y*NdL, KDLC.z*NdL, 0.0);\n' +
    '      Id2 = vec4(max(min(Id2.x,1.0), 0.0), max(min(Id2.y,1.0), 0.0), max(min(Id2.z,1.0), 0.0), 0.0);\n' +

    '      if(specularOO == 1.0) {\n' +
    '        vec3 N = normalize(v_Normal.xyz);\n' +
    '        L = normalize(vec3((0.0-f_Position.x), (500.0-f_Position.y), (0.0-f_Position.z)));\n' +
    '        vec3 V =normalize(vec3((-1.0*viewX), (-1.0*viewY), (-1.0*viewZ)));\n' + 
    '        vec3 LpV = normalize(vec3(V.x + L.x,V.y + L.y,V.z+L.z));\n' +   
    '        vec3 H = normalize(LpV);\n' +
    '        float NdH = dot(N,H);\n' +
    '        NdH = max(0.0, NdH);\n' +
    '        NdH = pow(NdH, NS);\n' +
    '        vec3 KSLC = vec3(KS.r*LC.r, KS.g*LC.g, KS.b*LC.b);\n' +
    '        Is2 = vec4((KSLC.r*NdH), (KSLC.g*NdH), (KSLC.b*NdH), 0.0);\n' +
    '        Is2 = vec4(max(min(Is2.r,1.0), 0.0), max(min(Is2.g,1.0), 0.0), max(min(Is2.b,1.0), 0.0), 0.0);\n' +
    '      } \n' +
    '      else {\n' +
    '        Is2 = vec4(0.0,0.0,0.0,0.0);\n' +
    '      }\n' +
    '    }\n' +
    '    else \n' +
    '    {\n' +
    '      Is2 = vec4(0.0,0.0,0.0,0.0);\n' +
    '      Id2 = vec4(0.0,0.0,0.0,0.0);\n' +
    '    }\n' +

    '    if(((lS2 == 1.0 || lS1 == 1.0) && (ambientOO == 1.0))) {\n' +
    '      amb = vec4(KA.r, KA.g, KA.b, 0.0);\n' +
    '    }\n' +
    '    else {\n' +
    '      amb = vec4(0.0,0.0,0.0,0.0);\n' +
    '    }\n' +
    '    vC = texture2D(u_Sampler, v_TexCoord);\n' +
    '    vC = vec4(vC.r, vC.g, vC.b, 0.0);\n' +
    '    vC = vC + Is1 + Is2 + amb + v_Color;\n' +
    '    vC = vec4( max(min(vC.r, 1.0), 0.0), max(min(vC.g, 1.0), 0.0), max(min(vC.b, 1.0), 0.0), max(min(vC.a, 1.0), 0.0) );\n' +
	'    gl_FragColor = vC;\n' +
    '  }\n' +
	'} else {\n' +
	'    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
	'  }\n' +
	'}\n';

//*******************************************************************************************************
//                                        GLOBAL DATA
//*******************************************************************************************************
//Data to hold information related to our poly-line spine
var spinePoints = [];            //Storing spine points
var RCPoints = [];              //Storing spine points Created on a LC
var LCPoints = [];              //Storing spine points Created on a RC
var shapes = [];
var vertices = [];
var indices = [];
var flatnormals = [];
var smoothnormals = [];
var vecflatnormals = [];
var vecnormals = [];
var colors = [];
var facevertices = [];

//Data to hold our Objects
var meshObjs = [];
function meshObj(shape)
{
    this.shape = shape;
    this.vertices = [];
    this.indices = [];
    this.colors = [];
    this.flatNormals = [];
    this.smoothNormals = [];
    this.faceVertices = [];
    this.surfaceNormals = [];
    this.texCoords = [];
    this.KD = [];
    this.KA = [];
    this.KS = [];
    this.NS = 1.0;
    this.transformationMatrix = [];
    this.rotationMatrix = [];
    this.objectCoordinate = [];
    this.ratio = 1.0;
    this.texChoice = 1;
}

var lightObjs = [];
function lightObj(type, enable, position, color, colorObj, vertices, indices) {
    this.type = type;
    this.enable = enable;
    this.position = position
    this.color = color;
    this.colorObj = colorObj;
    this.vertices = vertices;
    this.indices = indices;
}

//Control Variables
var currentlyGenerating = false;
var smooth = true;
var lS1OO = true;
var lS2OO = true;
var specLight = true;
var ambLight = true;
var showNormals = false;
var ortho = true;
var selectedObj = -1;
var inTranslation = false;
var inRotation = false;
var moveCam = false;
var clickOff = false;
var leftC = false, rightC = false, middleC = false;
var mouseD = false;

//other
var glossFactor = 1.0;
var worldCoordinate = [0.0,0.0,0.0];
var iX, iY, iZ;
var FOV = 30.0;
var eX = 365.0, eY = 100, eZ = 1700, aX = 0, aY = 0, aZ = 0, L = -500.0, R = 500.0, B=-500.0, T=500.0;
var NEAR = -500.0, FAR = 500.0;
var nX, nY;

//*******************************************************************************************************
//                                        MAIN
//*******************************************************************************************************
function main() 
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	setUpOpenGL(gl);

	//Call screenRefreshLines, a function to clear the canvas and to draw our polylines if we've any vertices. 
	//Details for screenRefreshLines are given below, including details on the arguments. 
	screenRefreshLines(gl, 0);

	// Register function (event handler) to be called on a mouse move
	canvas.onmousemove = function(ev){ handleMovement(ev, gl, canvas); };

	canvas.onwheel = function(ev){ scaleObject(ev, gl, canvas); };

	canvas.onmousedown = function(ev){ translateObjectInitial(ev, gl, canvas); };
	canvas.onmouseup = function(ev){ translateObjectFinal(ev, gl, canvas); };
}


//*******************************************************************************************************
//                                        PRIMARY FUNCTIONS
//*******************************************************************************************************
function setUpOpenGL(gl)
{
	//Set up file input
	setupIOSOR("fileName");

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) 
	{
		console.log('Failed to intialize shaders.');
		return;
	}

	// Get the storage location of u_Sampler
	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
	if (!u_Sampler) {
	console.log('Failed to get the storage location of u_Sampler');
	return false;
	}

	setUpProjMat(gl);

	setUpLights();

	loadTextures(gl);

	loadTexture(gl, u_Sampler, 0);
}


function setUpLights()
{
	var lightVerts = [];
	var lightInds = [];

	lightVerts.push(-10.0);
	lightVerts.push(10.0);
	lightVerts.push(0.0);
	lightVerts.push(1.0);
	lightVerts.push(490.0);
	lightVerts.push(510.0);
	lightVerts.push(500.0);
	lightVerts.push(1.0);
	lightVerts.push(10.0);
	lightVerts.push(-10.0);
	lightVerts.push(0.0);
	lightVerts.push(1.0);
	lightVerts.push(510.0);
	lightVerts.push(490.0);
	lightVerts.push(500.0);
	lightVerts.push(1.0);

	lightInds.push(0);
	lightInds.push(1);
	lightInds.push(3);
	lightInds.push(0);
	lightInds.push(2);
	lightInds.push(3);

	var dirLight = new lightObj(1.0, 1.0, new Vector3([500.0,500.0,500.0]), new Vector3([1.0,1.0,1.0]), new Vector4([1.0,0.0,0.0,0.996]), lightVerts, lightInds);

	lightVerts = [   // Vertex coordinates
	 50.0, 550.0, 50.0, 1.0,  -50.0, 550.0, 50.0, 1.0,  -50.0, 450.0, 50.0, 1.0,   50.0, 450.0, 50.0, 1.0,  // v0-v1-v2-v3 front
	 50.0, 550.0, 50.0, 1.0,   50.0, 450.0, 50.0, 1.0,   50.0, 450.0,-50.0, 1.0,   50.0, 550.0,-50.0, 1.0,  // v0-v3-v4-v5 right
	 50.0, 550.0, 50.0, 1.0,   50.0, 550.0,-50.0, 1.0,  -50.0, 550.0,-50.0, 1.0,  -50.0, 550.0, 50.0, 1.0,  // v0-v5-v6-v1 up
	-50.0, 550.0, 50.0, 1.0,  -50.0, 550.0,-50.0, 1.0,  -50.0, 450.0,-50.0, 1.0,  -50.0, 450.0, 50.0, 1.0, // v1-v6-v7-v2 left
	-50.0, 450.0,-50.0, 1.0,   50.0, 450.0,-50.0, 1.0,   50.0, 450.0, 50.0, 1.0,  -50.0, 450.0, 50.0, 1.0,  // v7-v4-v3-v2 down
	 50.0, 450.0,-50.0, 1.0,  -50.0, 450.0,-50.0, 1.0,  -50.0, 550.0,-50.0, 1.0,   50.0, 550.0,-50.0, 1.0  // v4-v7-v6-v5 back
	];

	lightInds = [       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back     
	];

	var ptLight = new lightObj(0.0, 1.0, new Vector3([0.0,500.0,0.0]), new Vector3([1.0,1.0,0.0]), new Vector4([1.0,1.0,0.0,0.992]), lightVerts, lightInds);

	lightObjs.push(dirLight);
	lightObjs.push(ptLight);
}


function click(ev, gl, canvas) 
{
	var x = ev.clientX, y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
	var pixels = new Uint8Array(4); // Array for storing the pixel value
	var x_in_canvas = x - rect.left, y_in_canvas = canvas.height - (ev.clientY - rect.top);
	var tempNormalHolder = [];
	gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	var tempLPExpHolder = [];
	var noSelection = false;

	if(pixels[3] < 255 && pixels[3] > 0)
	{
		if(spinePoints.length > 0)
		{
			noSelection = true;
		}
	}

	console.log('RGB: ' + pixels[0] + pixels[1] + pixels[2] + pixels[3] );
	if(pixels[3] < 255 && pixels[3] > 252 && !noSelection)
	{
		console.log('Light source change triggered');
		if(pixels[3] == 254)
		{
		  if(lS1OO == true)
		  {
		    lS1OO = false
		  }
		  else
		  {
		    lS1OO = true
		  }
		}
		else if (pixels[3] == 253)
		{
		  if(lS2OO == true)
		  {
		    lS2OO = false
		  }
		  else
		  {
		    lS2OO = true;
		  }
		}
		drawScene(gl);
	}
	else if(pixels[3] < 253 && pixels[3] > 0 && !noSelection)
	{
		var objIndex = 252 - pixels[3];
		var colorHolder = [];

		var obj = meshObjs[selectedObj];

		if(selectedObj > -1 && selectedObj != objIndex)
		{
			for(var i = 0; i < ((obj.colors.length)/4); i++)
			{
				colorHolder.push(0.0);
				colorHolder.push(0.0);
				colorHolder.push(0.0);
				colorHolder.push((.988235-(selectedObj*.003921)));
			}
			meshObjs[selectedObj].colors = colorHolder;
		}

		if(selectedObj != objIndex)
		{
			selectedObj = objIndex;

			colorHolder = [];

			for(var i = 0; i < meshObjs[selectedObj].colors.length; i++)
			{
				colorHolder.push(0.5);
				colorHolder.push(0.5);
				colorHolder.push(0.5);
				colorHolder.push((.988235-(selectedObj*.003921)));
			}
			meshObjs[selectedObj].colors = colorHolder;
		}
		drawScene(gl);
	}
	else if(selectedObj > -1)
	{
		var obj = meshObjs[selectedObj];
		var colorHolder = [];
		for(var i = 0; i < ((obj.colors.length)/4); i++)
		{
			colorHolder.push(0.0);
			colorHolder.push(0.0);
			colorHolder.push(0.0);
			colorHolder.push((.988235-(selectedObj*.003921)));
		}
		meshObjs[selectedObj].colors = colorHolder;
		selectedObj = -1;
		drawScene(gl);
	}
	else if(ev.button != 1)
	{
		if(selectedObj > -1)
		{
			var obj = meshObjs[selectedObj];
			var colorHolder = [];
			for(var i = 0; i < ((obj.colors.length)/4); i++)
			{
				colorHolder.push(0.0);
				colorHolder.push(0.0);
				colorHolder.push(0.0);
				colorHolder.push((.988235-(selectedObj*.003921)));
			}
			meshObjs[selectedObj].colors = colorHolder;
		}
		tempLPExpHolder = []; //used for holding the expanded version of linePoints, for easier conversion to a typed array for the vertex shader.

		//Converting coordinates passed into function. Canvas -> WEBGL
		x = calculateWEBGLXCoordinate(ev, canvas);
		y = calculateWEBGLYCoordinate(ev, canvas);

		spinePoints.push([x,y]);

		// Filling tempLPExpHolder with expanded version of coord's in linePoints, for conversion to a typed array for the vertex shader.
		for(var i = 0; i < (spinePoints.length*2); i+=2)
		{
			tempLPExpHolder.push(spinePoints[i/2][0]);
	  		tempLPExpHolder.push(spinePoints[i/2][1]);
		} 

		// Determine if the mouse button clicked is the left mouse button
		if(ev.button == 0)
		{
			drawScene(gl);
			var n = ((tempLPExpHolder.length)/2);
			var inProgress = Float32Array.from(tempLPExpHolder);
			bufferIntoVertexArray(gl, inProgress, 2, gl.FLOAT, 'a_Position');

			if(!currentlyGenerating)
			{
				currentlyGenerating = true;
			}

			prepLineDrawing(gl);

	  		//Update LCPoints array
	  		LCPoints.push(x);
	  		LCPoints.push(y);

	  		//Echo Click Location
	  		console.log('Left Click Mouse Position(WebGL Coordinates): (' + x + ', ' + y + ')');

	  		screenRefreshLines(gl, n);
		}
		//Determine if Mouse button pressed is the right mouse button
		else if(ev.button == 2)
		{
		  	//Disable Dialog box
		  	canvas.addEventListener('contextmenu', function(ev) 
		  	{
		    	{
		      		ev.preventDefault();
		      		return false;
		    	}
		  	}, false);

		  	if(currentlyGenerating)
		  	{
		  		currentlyGenerating = false;
		  	    RCPoints.push(x);
		  		RCPoints.push(y);
		  				  	// Echo Click Location
			  	console.log('Right Click Mouse Position(WebGL Coordinates): (' + x + ', ' + y + ')');

			  	generateCylinder(gl);

			  	var genCyl= new meshObj(shapes);
			  	genCyl.indices = indices;

			  	var tempExpNormHolder = [];
			  	for(var i = 0; i < vecnormals.length; i++)
			  	{
			  		tempExpNormHolder.push(vecnormals[i].elements[0]);
			  		tempExpNormHolder.push(vecnormals[i].elements[1]);
			  		tempExpNormHolder.push(vecnormals[i].elements[2]);
			  	}

			  	var xAve=0.0, yAve=0.0, zAve=0.0;
			  	for(var i = 0; i < spinePoints.length; i++)
			  	{
			  		xAve += spinePoints[i][0];
			  		yAve += spinePoints[i][1];
			  	}

			  	xAve = xAve / spinePoints.length;
			  	yAve = yAve / spinePoints.length;

			  	genCyl.objectCoordinate = [xAve,yAve,zAve];
			  	for(var i = 0; i < (facevertices.length/3); i++)
			  	{
			  		console.log('yval in of fv# ' + i + ': ' + facevertices[i*3+1]);
			  	}

			  	for(var i = 0; i < (facevertices.length/3); i++)
			  	{
			  		facevertices[3*i] = facevertices[3*i] - xAve;
			  		facevertices[(3*i)+1] = facevertices[(3*i)+1] - yAve;
			  		facevertices[(3*i)+2] = facevertices[(3*i)+2] - zAve;
			  	}

			  	for(var i = 0; i < (tempExpNormHolder.length/3); i++)
			  	{
			  		tempExpNormHolder[3*i] = tempExpNormHolder[3*i] - xAve;
			  		tempExpNormHolder[(3*i)+1] = tempExpNormHolder[(3*i)+1] - yAve;
			  		tempExpNormHolder[(3*i)+2] = tempExpNormHolder[(3*i)+2] - zAve;
			  	}

			  	genCyl.surfaceNormals = tempExpNormHolder;
			  	genCyl.flatNormals = flatnormals;
			  	genCyl.smoothNormals = smoothnormals;
			  	genCyl.colors = colors;
			  	genCyl.faceVertices = facevertices;
			  	genCyl.KA = [0,0,0.2];
			  	genCyl.KD = [1,0,0];
			  	genCyl.KS = [0,1,0];
			  	genCyl.NS = glossFactor;

			  	for(var i = 0; i < (facevertices.length/3); i++)
			  	{
			  		console.log('yval of fv# ' + i + ': ' + facevertices[i*3+1]);
			  	}

			  	var transVerts = [];

			  	for(var i = 0; i < (vertices.length)/3; i++)
			  	{
			  		var vertHolder = [];
			  		vertHolder = [(vertices[i*3]+(-1.0*xAve)), (vertices[(i*3)+1]+(-1.0*yAve)), (vertices[(i*3)+2]+(-1.0*zAve))];
			  		transVerts.push(vertHolder[0]);
			  		transVerts.push(vertHolder[1]);
			  		transVerts.push(vertHolder[2]);
			  	}
			  	genCyl.vertices = transVerts;

			  	var texHold = [];
			  	for(var i=0; i < (vertices.length/144); i++)
			  	{
			  		for(var j=0; j<2; j++)
			  		{
				  		for(var k=0; k<12; k++)
				  		{
				  			texHold.push(j*1.0);
				  			texHold.push(1.0 - (k*0.08333));
				  			texHold.push(j*1.0);
				  			texHold.push(1.0 - ((k+1)*0.08333));
				  		}
				  	}
			  	}

			  	genCyl.texCoords = texHold;

			  	genCyl.transformationMatrix = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, xAve, yAve, zAve, 1.0];
			  	genCyl.rotationMatrix = [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0];

				meshObjs.push(genCyl);

			  	drawScene(gl);

			  	// Read off all vertices that make up the now completed polyline.
			  	console.log('Polyline Completed, Printing List of Coordinates for Polyline: ');

			  	for(var i = 0; i < (spinePoints.length); i += 1)
			  	{
			    	console.log('(' + spinePoints[i][0] + ', ' + spinePoints[i][1] + ')');
			  	}

			  	clear();
		  	}
		}
	}
}


function clear()
{
    spinePoints = [];            //Storing spine points
    shapes = [];
    vertices = [];
    indices = [];
    flatnormals = [];
    smoothnormals = [];
    vecflatnormals = [];
    vecnormals = [];
    colors = [];
    facevertices = [];
    leftC = false;
    rightC = false;
    middleC = false;
}


function move(ev, gl, canvas)
{
	//Determine if the polyline is not completed and if there is at least one point in the polyline.
	if(currentlyGenerating)
	{
		var tempLPExpHolder = []; //used to hold expanded version of LP and of the extra mouse location
		var n;  //n here is used to represent the number of verts that need connectuions drawn between them

		//Converting coordinates passed into function. Canvas -> WEBGL
		var x = calculateWEBGLXCoordinate(ev, canvas);
		var y = calculateWEBGLYCoordinate(ev, canvas);

		//Expand LP into tempLPExpHolder
		for(var i = 0; i < (spinePoints.length*2); i+=2)
		{
			tempLPExpHolder[i] = spinePoints[i/2][0];
			tempLPExpHolder[i+1] = spinePoints[i/2][1];
		}

		// Take the mouse position Vertex, and push it to the temp array. 
		tempLPExpHolder.push(x); 
		tempLPExpHolder.push(y);

		// Create a Float32Array from tempLPExpHolder(WEBGL needs typed arrays)
		var inProgress = Float32Array.from(tempLPExpHolder); 

		//set n, the num of verts to drawn lines between
		n = ((tempLPExpHolder.length) / 2);

		drawScene(gl);

		prepLineDrawing(gl);

		bufferIntoVertexArray(gl, inProgress, 2, gl.FLOAT, 'a_Position'); 

		// Call screenRefreshLines function to clear canvas and draw our known lines + mouse position(unconfirmed)
		screenRefreshLines(gl, n);
	}
} 


function prepLineDrawing(gl)
{
	var colorProgress = [];
	var normalProgress = [];
	var fVProgress = [];
	var texProgress = [];

	for(var i = 0; i < (spinePoints.length+1); i++)
	{
		colorProgress.push(0.0);
		colorProgress.push(0.0);
		colorProgress.push(0.0);
		normalProgress.push(0.0);
		normalProgress.push(0.0);
		normalProgress.push(0.0);
		fVProgress.push(0.0);
		fVProgress.push(0.0);
		fVProgress.push(0.0);
		texProgress.push(0.0);
		texProgress.push(0.0);
	}
	var vColorProgress = Float32Array.from(colorProgress);
	var vNormalProgress = Float32Array.from(normalProgress);
	var vFVProgress = Float32Array.from(fVProgress);
	var vTexProgress = Float32Array.from(texProgress);
	bufferIntoVertexArray(gl, vColorProgress, 3, gl.FLOAT, 'a_Color');
	bufferIntoVertexArray(gl, vNormalProgress, 3, gl.FLOAT, 'a_Normal');
	bufferIntoVertexArray(gl, vFVProgress, 3, gl.FLOAT, 'fV_Position');
	bufferIntoVertexArray(gl, vTexProgress, 2, gl.FLOAT, 'a_TexCoord');
}


function screenRefreshLines(gl, n)
{
	//Ensuring that a single point has been placed on the canvas so that unnecessary actions aren't performed
	if(n > 0)
	{
		// Draw to the Canvas: Series of connected lines, start at vertex 0, call shaders n times.
		gl.drawArrays(gl.LINE_STRIP, 0, n);
	}
}


function screenRefreshCylinders(gl, n)
{
  //Ensuring that a single index has been created so that unnecessary actions aren't performed
  if(n > 0)
  {
    //Enable Depth test
    gl.enable(gl.DEPTH_TEST);

    // Draw the Cylinders
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    //defensive programming
    gl.disable(gl.DEPTH_TEST);
  }
}


function setUpProjMat(gl)
{
	var projMatrix, u_ProjMatrix;
	// Create the matrix to set the eye point, and the line of sight
	projMatrix = new Matrix4();  // The projection matrix

	// get the storage location of u_ProjMatrix
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	if (!u_ProjMatrix) 
	{ 
		console.log('Failed to get the storage location of u_ProjMatrix');
		return;
	}

	var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
	if (!u_xformMatrix) 
	{
		console.log('Failed to get the storage location of u_xformMatrix');
		return -1;
	}

	var u_rformMatrix = gl.getUniformLocation(gl.program, 'u_rformMatrix');
	if (!u_rformMatrix) 
	{
		console.log('Failed to get the storage location of u_rformMatrix');
		return -1;
	}

	var xV = gl.getUniformLocation(gl.program, 'viewX');
	if (!xV) 
	{
		console.log('Failed to get the storage location of viewX');
		return -1;
	}

	var yV = gl.getUniformLocation(gl.program, 'viewY');
	if (!yV) 
	{
		console.log('Failed to get the storage location of viewY');
		return -1;
	}

	var zV = gl.getUniformLocation(gl.program, 'viewZ');
	if (!zV) 
	{
		console.log('Failed to get the storage location of viewZ');
		return -1;
	}

	var projChoice = gl.getUniformLocation(gl.program, 'projChoice');
	if (!projChoice) 
	{
		console.log('Failed to get the storage location of projChoice');
		return -1;
	}


	if(ortho == true)
	{
		projMatrix.setOrtho(L, R, B, T, NEAR, FAR);
		gl.uniform1f(xV, ((L+R)/2));
		gl.uniform1f(yV, ((B+T)/2));
		gl.uniform1f(zV, NEAR);
		gl.uniform1f(projChoice, 1.0);
	}
	else
	{
	    projMatrix.setPerspective(FOV, 1.0, 1200.0, 2200.0);  
	    projMatrix.lookAt(eX, eY, eZ, aX, aY, aZ, 0, 1, 0); 
		gl.uniform1f(xV, eX);
		gl.uniform1f(yV, eY);
		gl.uniform1f(zV, eZ); 
		gl.uniform1f(projChoice, 0.0);
	}
	
	var transMat = [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0];
	var rotMat = [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0];
	// Pass the projection matrix to u_ProjMatrix
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.uniformMatrix4fv(u_xformMatrix, false, transMat);
	gl.uniformMatrix4fv(u_rformMatrix, false, rotMat);
}


function bufferIntoVertexArray(gl, data, num, type, attribute) 
{
	var buffer = gl.createBuffer();   // Create a buffer object

	if (!buffer) 
	{
		console.log('Failed to create the buffer object');
		return false;
	}

	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	// Assign the buffer object to the attribute variable
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) 
	{
		console.log('Failed to get the storage location of ' + attribute);
		return false;
	}

	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	// Enable the assignment of the buffer object to the attribute variable
	gl.enableVertexAttribArray(a_attribute);

	return true;
}

function calculateWEBGLXCoordinate(ev, canvas)
{
	var x = ev.clientX; // x coordinate of a mouse pointer, with respect to the canvas system.
	var rect = ev.target.getBoundingClientRect() ; //position of canvas in client area

	x = ((x - rect.left) - canvas.width/2)/(canvas.width/2); //converting

	return (x*500); //returned value is the X-coord in the WEBGL system
}

function calculateWEBGLYCoordinate(ev, canvas)
{
	var y = ev.clientY; // y coordinate of a mouse pointer, with respect to the canvas system
	var rect = ev.target.getBoundingClientRect() ; //position of canvas in client area

	y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); //converting

	return (y*500); //returned value is the Y-coord in the WEBGL System
}

function drawScene(gl)
{
	var sPDraw = gl.getUniformLocation(gl.program, 'sPDraw');
	if (!sPDraw) 
	{
		console.log('Failed to get the storage location of sPDraw');
		return -1;
	}

	var lODraw = gl.getUniformLocation(gl.program, 'lODraw');
	if (!lODraw) 
	{
		console.log('Failed to get the storage location of lODraw');
		return -1;
	}

	var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
	if (!u_xformMatrix) 
	{
		console.log('Failed to get the storage location of u_xformMatrix');
		return -1;
	}

	var u_rformMatrix = gl.getUniformLocation(gl.program, 'u_rformMatrix');
	if (!u_rformMatrix) 
	{
		console.log('Failed to get the storage location of u_rformMatrix');
		return -1;
	}

	updateDraw(gl);

	gl.uniform1f(sPDraw, 0.0);
	gl.uniform1f(lODraw, 0.0);
	// Specify the color for clearing <canvas>, in this case, white
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	
  	for(var i = 0; i < meshObjs.length; i++)
  	{
  		var cylVerts = Float32Array.from(meshObjs[i].vertices);
  		var cylCols = Float32Array.from(meshObjs[i].colors);
  		var cylInds = Uint16Array.from(meshObjs[i].indices);
  		var cylTexs = Float32Array.from(meshObjs[i].texCoords);
  		var cylFaceverts;
  		var cylNorms;

  		if(smooth == true)
  		{
  			cylNorms = Float32Array.from(meshObjs[i].smoothNormals);
  			cylFaceverts = Float32Array.from(meshObjs[i].vertices);
  		}
  		else
  		{
  			cylNorms = Float32Array.from(meshObjs[i].flatNormals);
  			cylFaceverts = Float32Array.from(meshObjs[i].faceVertices);
  		}

		var KS = gl.getUniformLocation(gl.program, 'KS');
		if (!KS) 
		{
			console.log('Failed to get the storage location of KS');
			return -1;
		}

		var KD = gl.getUniformLocation(gl.program, 'KD');
		if (!KD) 
		{
			console.log('Failed to get the storage location of KD');
			return -1;
		}

		var KA = gl.getUniformLocation(gl.program, 'KA');
		if (!KA) 
		{
			console.log('Failed to get the storage location of KA');
			return -1;
		}

		var NS = gl.getUniformLocation(gl.program, 'NS');
		if (!NS) 
		{
			console.log('Failed to get the storage location of NS');
			return -1;
		}

		gl.uniform3f(KS, meshObjs[i].KS[0], meshObjs[i].KS[1], meshObjs[i].KS[2]);
		gl.uniform3f(KD, meshObjs[i].KD[0], meshObjs[i].KD[1], meshObjs[i].KD[2]);
		gl.uniform3f(KA, meshObjs[i].KA[0], meshObjs[i].KA[1], meshObjs[i].KA[2]);
		gl.uniform1f(NS, meshObjs[i].NS);
		gl.uniformMatrix4fv(u_xformMatrix, false, meshObjs[i].transformationMatrix);
		gl.uniformMatrix4fv(u_rformMatrix, false, meshObjs[i].rotationMatrix);

		//Creating a Buffer for indices inside the WEBGL System. 
		var indexBuffer = gl.createBuffer();
		if (!indexBuffer) {
			console.log('Failed to create the buffer object');
			return -1;
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		if(i == selectedObj)
		{
			gl.uniform1f(lODraw, 1.0);
		}
		else
		{
			gl.uniform1f(lODraw, 0.0);
		}

		// Get the storage location of u_Sampler
		var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
		if (!u_Sampler) {
		console.log('Failed to get the storage location of u_Sampler');
		return false;
		}

		loadTexture(gl, u_Sampler, meshObjs[i].texChoice);

  		bufferIntoVertexArray(gl, cylVerts, 3, gl.FLOAT, 'a_Position');
  		bufferIntoVertexArray(gl, cylCols, 4, gl.FLOAT, 'a_Color');
  		bufferIntoVertexArray(gl, cylNorms, 3, gl.FLOAT, 'a_Normal');
  		bufferIntoVertexArray(gl, cylFaceverts, 3, gl.FLOAT, 'fV_Position');
  		bufferIntoVertexArray(gl, cylTexs, 2, gl.FLOAT, 'a_TexCoord');
  		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cylInds, gl.STATIC_DRAW);

  		screenRefreshCylinders(gl, cylInds.length);
  	}

  	gl.uniformMatrix4fv(u_xformMatrix, false, [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
  	gl.uniformMatrix4fv(u_rformMatrix, false, [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);

  	gl.uniform1f(lODraw, 1.0);
  	if(showNormals == true)
  	{
  		for(var i = 0; i < meshObjs.length; i++)
  		{
			var normVerts = [];
			var normCols = [];
			var normFV = [];
			var normNorms = [];
			var normTex = [];
  			normVerts = meshObjs[i].surfaceNormals;
  			for(var j = 0; j < (normVerts.length / 3); j++)
  			{
  				normCols.push(1.0);
  				normCols.push(0.0);
  				normCols.push(0.0);
  				normFV.push(0.0);
  				normFV.push(0.0);
  				normFV.push(0.0);
  				normNorms.push(0.0);
  				normNorms.push(0.0);
  				normNorms.push(0.0);
  				normTex.push(0.0);
  				normTex.push(0.0);
  			}

  			normVerts = Float32Array.from(normVerts);
  			normCols = Float32Array.from(normCols);
  			normFV = Float32Array.from(normFV);
  			normNorms = Float32Array.from(normNorms);
  			normTex = Float32Array.from(normTex);
  			gl.uniformMatrix4fv(u_xformMatrix, false, meshObjs[i].transformationMatrix);
  			gl.uniformMatrix4fv(u_rformMatrix, false, meshObjs[i].rotationMatrix);
			bufferIntoVertexArray(gl, normVerts, 3, gl.FLOAT, 'a_Position');
			bufferIntoVertexArray(gl, normCols, 3, gl.FLOAT, 'a_Color');
			bufferIntoVertexArray(gl, normNorms, 3, gl.FLOAT, 'a_Normal');
			bufferIntoVertexArray(gl, normFV, 3, gl.FLOAT, 'fV_Position');
			bufferIntoVertexArray(gl, normTex, 2, gl.FLOAT, 'a_TexCoord');

			gl.drawArrays(gl.LINES, 0, (normVerts.length / 3));
  		}
  	}

  	gl.uniformMatrix4fv(u_xformMatrix, false, [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
  	gl.uniformMatrix4fv(u_rformMatrix, false, [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
  	gl.uniform1f(lODraw, 1.0);
  	for(var i = 0; i < lightObjs.length; i++)
  	{
  		var lightObjVerts = Float32Array.from(lightObjs[i].vertices);
  		var lightObjInds = Uint16Array.from(lightObjs[i].indices);
  		var lightObjColor = [];
  		var lightObjNormal = [];
  		var lightFV = [];
  		var lightTex = [];
  		for(var j = 0; j < lightObjVerts.length; j++)
  		{
  			if(lightObjs[i].enabled == 1.0)
  			{
	  			lightObjColor.push(lightObjs[i].colorObj.elements[0]);
	  			lightObjColor.push(lightObjs[i].colorObj.elements[1]);
	  			lightObjColor.push(lightObjs[i].colorObj.elements[2]);
	  			lightObjColor.push(lightObjs[i].colorObj.elements[3]);
  			}
  			else
  			{
	  			lightObjColor.push(0.5);
	  			lightObjColor.push(0.5);
	  			lightObjColor.push(0.5);
	  			lightObjColor.push(lightObjs[i].colorObj.elements[3]);	
  			}
  			lightObjNormal.push(0.0);
			lightObjNormal.push(0.0);
			lightObjNormal.push(0.0);
			lightFV.push(0.0);
			lightFV.push(0.0);
			lightFV.push(0.0);
			lightTex.push(0.0);
			lightTex.push(0.0);

  		}
		lightObjColor = Float32Array.from(lightObjColor);
		lightObjNormal = Float32Array.from(lightObjNormal);
		lightTex = Float32Array.from(lightTex);
		lightFV = Float32Array.from(lightFV);
		
		var indexBuffer = gl.createBuffer();
		if (!indexBuffer) {
			console.log('Failed to create the buffer object');
			return -1;
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		bufferIntoVertexArray(gl, lightObjVerts, 4, gl.FLOAT, 'a_Position');
		bufferIntoVertexArray(gl, lightObjColor, 4, gl.FLOAT, 'a_Color');
  		bufferIntoVertexArray(gl, lightObjNormal, 3, gl.FLOAT, 'a_Normal');
  		bufferIntoVertexArray(gl, lightFV, 3, gl.FLOAT, 'fV_Position');
  		bufferIntoVertexArray(gl, lightTex, 2, gl.FLOAT, 'a_TexCoord');
  		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lightObjInds, gl.STATIC_DRAW);

  		screenRefreshCylinders(gl, lightObjInds.length);
  	}
  	gl.uniform1f(lODraw, 0.0);

  	gl.uniform1f(sPDraw, 1.0);
}


function loadTexture(gl, u_Sampler, texChoice) {
  
  if(texChoice == 0)
  {
	gl.activeTexture(gl.TEXTURE0);

	// Set the texture unit 0 to the sampler
	gl.uniform1i(u_Sampler, 0);
  }
  else if(texChoice == 1)
  {
	gl.activeTexture(gl.TEXTURE1);

	// Set the texture unit 0 to the sampler
	gl.uniform1i(u_Sampler, 1);
  }
  else if(texChoice == 2)
  {
	gl.activeTexture(gl.TEXTURE2);

	// Set the texture unit 0 to the sampler
	gl.uniform1i(u_Sampler, 2);
  }
}


function loadTextures(gl)
{
	var texture = gl.createTexture();   // Create a texture object
	if (!texture) {
	console.log('Failed to create the texture object');
	return false;
	}
	var texturetwo = gl.createTexture();   // Create a texture object
	if (!texturetwo) {
	console.log('Failed to create the texture object');
	return false;
	}
	var texturethree = gl.createTexture();   // Create a texture object
	if (!texturethree) {
	console.log('Failed to create the texture object');
	return false;
	}


	// Get the storage location of u_Sampler
	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
	if (!u_Sampler) {
	console.log('Failed to get the storage location of u_Sampler');
	return false;
	}
	image = new Image();  // Create the image object
	if (!image) {
	console.log('Failed to create the image object');
	return false;
	}

	imagetwo = new Image();  // Create the image object
	if (!image) {
	console.log('Failed to create the image object');
	return false;
	}
	imagethree = new Image();  // Create the image object
	if (!imagethree) {
	console.log('Failed to create the image object');
	return false;
	}

	image.src = 'images/tex1.jpg';

	image.onload = function() 
	{
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
		// Enable texture unit0
		gl.activeTexture(gl.TEXTURE0);
		// Bind the texture object to the target
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set the texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		// Set the texture image

		// let's assume all images are not a power of 2
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	}

	imagetwo.src = 'images/tex3.jpg';

	imagetwo.onload = function() 
	{
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
		// Enable texture unit0
		gl.activeTexture(gl.TEXTURE1);
		// Bind the texture object to the target
		gl.bindTexture(gl.TEXTURE_2D, texturetwo);

		// Set the texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		// Set the texture image

		// let's assume all images are not a power of 2
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imagetwo);
	}

	imagethree.src = 'images/space3.jpg';

	imagethree.onload = function() 
	{
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
		// Enable texture unit0
		gl.activeTexture(gl.TEXTURE2);
		// Bind the texture object to the target
		gl.bindTexture(gl.TEXTURE_2D, texturethree);

		// Set the texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		// Set the texture image

		// let's assume all images are not a power of 2
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imagethree);
	}
}


function updateDraw(gl)
{
	setUpProjMat(gl);
	var specularOO = gl.getUniformLocation(gl.program, 'specularOO');
	if (!specularOO) 
	{
		console.log('Failed to get the storage location of specularOO');
		return -1;
	}

	if(specLight == true)
	{
		gl.uniform1f(specularOO, 1.0);
	}
	else
	{
		gl.uniform1f(specularOO, 0.0);
	}

	var ambientOO = gl.getUniformLocation(gl.program, 'ambientOO');
	if (!ambientOO) 
	{
		console.log('Failed to get the storage location of ambientOO');
		return -1;
	}

	if(ambLight == true)
	{
		gl.uniform1f(ambientOO, 1.0);
	}
	else
	{
		gl.uniform1f(ambientOO, 0.0);
	}

	var lS1 = gl.getUniformLocation(gl.program, 'lS1');
	if (!lS1) 
	{
		console.log('Failed to get the storage location of lS1');
		return -1;
	}

	var lS2 = gl.getUniformLocation(gl.program, 'lS2');
	if (!lS2) 
	{
		console.log('Failed to get the storage location of lS2');
		return -1;
	}

	if(lS1OO == true)
	{
		gl.uniform1f(lS1, 1.0);
		lightObjs[0].enabled = 1.0;
	}
	else
	{
		gl.uniform1f(lS1, 0.0);
		lightObjs[0].enabled = 0.0;
	}

	if(lS2OO == true)
	{
		gl.uniform1f(lS2, 1.0);
		lightObjs[1].enabled = 1.0;
	}
	else
	{
		gl.uniform1f(lS2, 0.0);
		lightObjs[1].enabled = 0.0;
	}
}


function generateCylinder(gl)
{
  var radius = 50;  //5% of the smallest dimension of the canvas (2*.05 = .1 : WEBGL Coordinates range from -1 to 1 on either axis, scales to given dimensions)
  var arbitraryMat; //Set later as a tool for helping to rotate a vector
  var translateMat; //Set later as a tool for helping to translate a vector
  var combinedMat;  //Set later as a supertool for both translating and rotating a vector
  var resultVector; //Set later to hold a rotated and translated point that needs adding to our surface
  var surface;      //surface array to store our coord's per circle surface (one circle per surface array, later pushed in shapes array once surface pts are generated)
  var pointVector;  //will be used for our initial vector (spine pt's x,y coord's with a z value equal to radius)
  var axisVector;   //Will later be set to hold a vector representation of an axis of rotation, used for generating rotated points of each base of a cylinder, pre-joining.

  //iterate through each line/spine
  for(var i = 1; i < spinePoints.length; i++)
  {
    //create our axisVector
    axisVector = new Vector3([spinePoints[i-1][0] - spinePoints[i][0], spinePoints[i-1][1] - spinePoints[i][1], 0]);

    //Decides which surface to construct (first pt surface, then second pt surface)
    for(var j = 0; j < 2; j += 1)
    {
      surface = []; //used to store our coord's per cylinder base, specifically circular bases (before merging disconnects)

      //used in relation to for loop directly above, will generate a pointVector based on which surface we're working with
      if(j == 0)
      {
        pointVector = new Vector3([spinePoints[i-1][0], spinePoints[i-1][1], radius]);
      }
      else
      {
        pointVector = new Vector3([spinePoints[i][0], spinePoints[i][1], radius]);
      }

      //push our initial vector (defined above) onto our surface array
      surface.push(pointVector);

      //this for loop generates 22 different points (first already generated for us)
      for(var k = 0; k < 11; k++)
      {
        arbitraryMat = new Matrix4();   //used as a tool for rotation
        translateMat = new Matrix4();   //used as a tool for translation

        translateMat.translate(pointVector.elements[0], pointVector.elements[1], 0);    //specifies the translation to be made when a vector is multiplied to this matrix
        arbitraryMat.rotate((30*(k+1)), axisVector.elements[0], axisVector.elements[1], axisVector.elements[2]);  //specifies the rotation to be made when a vector is multiplied to this matrix
       
        combinedMat = translateMat.multiply(arbitraryMat);  //This is s super tool matrix, where when a vector is multiplied to this matrix, it is translated and rotated as specified by arbMat and tranMat.
        resultVector = combinedMat.multiplyVector3(new Vector3([0,0,radius])); //creating a pt needed for our surface with the comMat
        
        surface.push(resultVector);   //once our pt is generated, push it onto our surface array
        surface.push(resultVector);
      }
      surface.push(pointVector);

      //once all 24 pts are on the surface array, push surface array onto shapes array (global)
      shapes.push(surface);
    }
  }

  //once our shapes array is completed, call mergeDisjoints() to merge disconnected cylinder bases together, new shapes array is now shapes2
  mergeDisjoints();

  //once all surfaces are generated (bases of cylinders), call the function that creates our indices, fills our buffers, and ultimately draws our cylinders. 
  renderCylinderObject(gl);
}

function mergeDisjoints()
{
  var pointNum = 1;   //Used for keeping track of pt. Number for merging bases
  var axisVector1;    //Used as a vector represenation of different aor's. 
  var axisVector2;    //Used as a vector represenation of different aor's. 
  var newSurfacePoint; //Used to store new Surface Pts being generated in Vector Form
  var m1, b1, m2, b2, x, y; //Used for calculating specifics of merging surfaces
  var shapes2 = [];

  //push first surface onto shapes2 array as we aren't merging the ends
  shapes2.push(shapes[0]);

  //iterating through second shape to third to last shape, for merging
  for(var i = 1; i < (shapes.length-2); i+=2)
  {
    var newSurface = [];

    //create our axisVector1 - first surface
    axisVector1 = new Vector3([spinePoints[pointNum-1][0] - spinePoints[pointNum][0], spinePoints[pointNum-1][1] - spinePoints[pointNum][1], 0]);

    //create our axisVector2 - second surface
    axisVector2 = new Vector3([spinePoints[pointNum][0] - spinePoints[pointNum+1][0], spinePoints[pointNum][1] - spinePoints[pointNum+1][1], 0]);

    //iterating through points of each shape(s)
    for(var j = 0; j<shapes[i].length; j++)
    {
      //first surface workings
      m1 = ( axisVector1.elements[1] / axisVector1.elements[0] );
      b1 = shapes[i][j].elements[1] - (  m1 * shapes[i][j].elements[0] );

      //second surface workings
      m2 = ( axisVector2.elements[1] / axisVector2.elements[0] );
      b2 = shapes[i+1][j].elements[1] - (  m2 * shapes[i+1][j].elements[0] );

      //intersection calculations
      x = ((b2 - b1) / (m1 - m2))
      y = (((m1*b2)-(m2*b1)) / (m1-m2))

      //intersectionVectorCreation
      newSurfacePoint = new Vector3([x,y,shapes[i][j].elements[2]]);

      //Once our new surfacePt is generated, push it onto our currently generating Surface array.
      newSurface.push(newSurfacePoint);
    }

    //once all pts of a surface are generated, push it onto our shapes2 array
    shapes2.push(newSurface);
    shapes2.push(newSurface);

    //increment the spine point number we're working with
    pointNum++;
  }

  //push last surface onto shapes2 array as we aren't merging the ends
  shapes2.push(shapes[(shapes.length-1)]);

  shapes = shapes2;
}

function renderCylinderObject(gl) 
{
  //Pushing vertices(expanded) onto temp array
  for(var i = 0; i < shapes.length; i++)
  {
    for(var j = 0; j < shapes[i].length; j++)
    {
      vertices.push(shapes[i][j].elements[0]);
      vertices.push(shapes[i][j].elements[1]);
      vertices.push(shapes[i][j].elements[2]);
    }
    console.log('shape length: ' + shapes.length + ', shapes @' + i + ' length: ' + shapes[i].length);
  }

  //creating indices, storing inside the indices array, generating normals
  //iterating through each surface
  for(var i = 0; i < (shapes.length-1); i+=2)
  {
    //iterating through each pt of surface i
    for(var j = 0; j < shapes[i].length; j+=2)
    {
        generateNormal(i, j);   //generates the normal of our surface currently being created - This is Not yet fully functioning, so consider this Experimentation

        indices.push((24*(i+1))+j);       //24 : 26 : 28 for i=0 -> 72 for i=2
        indices.push(j+(24*i));         //0  : 2  : 4  for i=0 -> 48 for i=2
        indices.push(j+(24*i)+1);         //1  : 3  : 5  for i=0 -> 49 for i=2
        indices.push((24*(i+1))+j);       //24 : 26 : 28 for i=0 -> 72 for i=2
        indices.push((24*(i+1))+j+1);       //24 : 26 : 28 for i=0 -> 72 for i=2
        indices.push(j+(24*i)+1);         //1  : 3  : 5  for i=0 -> 49 for i=2
    }
  }

  generateFlatNormal();
  generateSmoothNormal();

  for(var i = 0 ; i < vertices.length; i++)
  {
  	colors.push(0.0);
  	colors.push(0.0);
  	colors.push(0.0);
	colors.push((.988235-(meshObjs.length*.003921)));
  }

  console.log('n length inside drawCyl: ' + indices.length);
}


function generateNormal(i, j)
{
  var v1, v2, N, pt1, pt2; //used for normal calculations

  //Create vector 1
  v1 = new Vector3([(shapes[i+1][j].elements[0] - shapes[i][j].elements[0]), (shapes[i+1][j].elements[1] - shapes[i][j].elements[1]), (shapes[i+1][j].elements[2] - shapes[i][j].elements[2])]);

  v2 = new Vector3([(shapes[i+1][j].elements[0] - shapes[i+1][j+1].elements[0]), (shapes[i+1][j].elements[1] - shapes[i+1][j+1].elements[1]), (shapes[i+1][j].elements[2] - shapes[i+1][j+1].elements[2])]);
  
  //Calculate our midway pt. between our 4 indices (Where our base pt. of our normal is going to go)
  pt1 = new Vector3([((shapes[i][j].elements[0] + shapes[i][j+1].elements[0] + shapes[i+1][j].elements[0] + shapes[i+1][j+1].elements[0]) / 4) , ((shapes[i][j].elements[1] + shapes[i][j+1].elements[1] + shapes[i+1][j].elements[1] + shapes[i+1][j+1].elements[1]) / 4) , ((shapes[i][j].elements[2] + shapes[i][j+1].elements[2] + shapes[i+1][j].elements[2] + shapes[i+1][j+1].elements[2]) / 4)]);
  
  //Calculate Normal Resulting from v1 x v2
  N = new Vector3([((v1.elements[1]*v2.elements[2])-(v1.elements[2]*v2.elements[1])), ((v1.elements[2]*v2.elements[0])-(v1.elements[0]*v2.elements[2])), ((v1.elements[0]*v2.elements[1])-(v1.elements[1]*v2.elements[0]))]);

  //Normalize our normal vector
  N.normalize();

  //calculate our next pt. of our normal vector
  pt2 = new Vector3([(pt1.elements[0] - (N.elements[0] *100)), (pt1.elements[1] - (N.elements[1] *100) ), (pt1.elements[2] - (N.elements[2] *100) ) ]);

  vecnormals.push(pt1);
  vecnormals.push(pt2);
}


function generateSmoothNormal()
{
  var smoothNormalHolder = [];
  //first surface : 0-23;1->21:2->22;23-0
  smoothNormalHolder.push(new Vector3([(vecflatnormals[23].elements[0] + vecflatnormals[0].elements[0]), (vecflatnormals[23].elements[1] + vecflatnormals[0].elements[1]),(vecflatnormals[23].elements[2] + vecflatnormals[0].elements[2]) ]));
  for(var i = 1; i < shapes[0].length; i+=2)
  {
    if(i != 23)
    {
      smoothNormalHolder.push(new Vector3([(vecflatnormals[i].elements[0] + vecflatnormals[i+1].elements[0]), ((vecflatnormals)[i].elements[1] + vecflatnormals[i+1].elements[1]),((vecflatnormals)[i].elements[2] + vecflatnormals[i+1].elements[2]) ]));
      smoothNormalHolder.push(new Vector3([((vecflatnormals)[i].elements[0] + vecflatnormals[i+1].elements[0]), ((vecflatnormals)[i].elements[1] + vecflatnormals[i+1].elements[1]),((vecflatnormals)[i].elements[2] + vecflatnormals[i+1].elements[2]) ]));
    }
    else
    {
      smoothNormalHolder.push(new Vector3([((vecflatnormals)[23].elements[0] + vecflatnormals[0].elements[0]), ((vecflatnormals)[23].elements[1] + vecflatnormals[0].elements[1]),((vecflatnormals)[23].elements[2] + vecflatnormals[0].elements[2]) ]));
    }
  }

  //middle surfaces
  for(var i = 1; i < (shapes.length - 2); i+=2)
  {
    for(var j = 0; j <2; j++)
    {
      smoothNormalHolder.push(new Vector3([vecflatnormals[i*24].elements[0]+vecflatnormals[((i+1)*24)-1].elements[0]+vecflatnormals[(i+1)*24].elements[0]+vecflatnormals[((i+2)*24)-1].elements[0], vecflatnormals[i*24].elements[1]+vecflatnormals[((i+1)*24)-1].elements[1]+vecflatnormals[(i+1)*24].elements[1]+vecflatnormals[((i+2)*24)-1].elements[1], vecflatnormals[i*24].elements[2]+vecflatnormals[((i+1)*24)-1].elements[2]+vecflatnormals[(i+1)*24].elements[2]+vecflatnormals[((i+2)*24)-1].elements[2]]));
      for(var k = 1; k < shapes[i].length; k+=2)
      {
        if(k != 23)
        {
          smoothNormalHolder.push(new Vector3([vecflatnormals[i*24 + k].elements[0]+vecflatnormals[(i*24)+k+1].elements[0]+vecflatnormals[(i+1)*24 + k].elements[0]+vecflatnormals[((i+1)*24)+k+1].elements[0], vecflatnormals[i*24 + k].elements[1]+vecflatnormals[(i*24)+k+1].elements[1]+vecflatnormals[(i+1)*24 + k].elements[1]+vecflatnormals[((i+1)*24)+k+1].elements[1], vecflatnormals[i*24 + k].elements[2]+vecflatnormals[(i*24)+k+1].elements[2]+vecflatnormals[(i+1)*24 + k].elements[2]+vecflatnormals[((i+1)*24)+k+1].elements[2]]));
          smoothNormalHolder.push(new Vector3([vecflatnormals[i*24 + k].elements[0]+vecflatnormals[(i*24)+k+1].elements[0]+vecflatnormals[(i+1)*24 + k].elements[0]+vecflatnormals[((i+1)*24)+k+1].elements[0], vecflatnormals[i*24 + k].elements[1]+vecflatnormals[(i*24)+k+1].elements[1]+vecflatnormals[(i+1)*24 + k].elements[1]+vecflatnormals[((i+1)*24)+k+1].elements[1], vecflatnormals[i*24 + k].elements[2]+vecflatnormals[(i*24)+k+1].elements[2]+vecflatnormals[(i+1)*24 + k].elements[2]+vecflatnormals[((i+1)*24)+k+1].elements[2]]));
        }
        else
        {
          smoothNormalHolder.push(new Vector3([vecflatnormals[i*24].elements[0]+vecflatnormals[((i+1)*24)-1].elements[0]+vecflatnormals[(i+1)*24].elements[0]+vecflatnormals[((i+2)*24)-1].elements[0], vecflatnormals[i*24].elements[1]+vecflatnormals[((i+1)*24)-1].elements[1]+vecflatnormals[(i+1)*24].elements[1]+vecflatnormals[((i+2)*24)-1].elements[1], vecflatnormals[i*24].elements[2]+vecflatnormals[((i+1)*24)-1].elements[2]+vecflatnormals[(i+1)*24].elements[2]+vecflatnormals[((i+2)*24)-1].elements[2]]));
        }
      }
    }
  }

  //last Surface
  smoothNormalHolder.push(new Vector3([((vecflatnormals)[((shapes.length)*24)-1].elements[0] + vecflatnormals[((shapes.length-1)*24)].elements[0]), ((vecflatnormals)[((shapes.length)*24)-1].elements[1] + vecflatnormals[((shapes.length-1)*24)].elements[1]),((vecflatnormals)[((shapes.length)*24)-1].elements[2] + vecflatnormals[((shapes.length-1)*24)].elements[2])]));
  for(var i = 1; i < shapes[(shapes.length-1)].length; i+=2)
  {
    if(i != 23)
    {
      smoothNormalHolder.push(new Vector3([((vecflatnormals)[i+((shapes.length-1)*24)].elements[0] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[0]), ((vecflatnormals)[i+((shapes.length-1)*24)].elements[1] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[1]),((vecflatnormals)[i+((shapes.length-1)*24)].elements[2] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[2])]));
      smoothNormalHolder.push(new Vector3([((vecflatnormals)[i+((shapes.length-1)*24)].elements[0] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[0]), ((vecflatnormals)[i+((shapes.length-1)*24)].elements[1] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[1]),((vecflatnormals)[i+((shapes.length-1)*24)].elements[2] + vecflatnormals[i+((shapes.length-1)*24)+1].elements[2])]));
    }
    else
    {
      smoothNormalHolder.push(new Vector3([((vecflatnormals)[((shapes.length)*24)-1].elements[0] + vecflatnormals[((shapes.length-1)*24)].elements[0]), ((vecflatnormals)[((shapes.length)*24)-1].elements[1] + vecflatnormals[((shapes.length-1)*24)].elements[1]),((vecflatnormals)[((shapes.length)*24)-1].elements[2] + vecflatnormals[((shapes.length-1)*24)].elements[2])]));
    }
  }

  for(var i = 0; i < smoothNormalHolder.length; i++)
  {
  	smoothnormals.push(smoothNormalHolder[i].elements[0]);
  	smoothnormals.push(smoothNormalHolder[i].elements[1]);
  	smoothnormals.push(smoothNormalHolder[i].elements[2]);
  }
}

function generateFlatNormal()
{
  faceverticesHolder = [];
  for(var i = 0; i < shapes.length; i+=2)
  {
    for(var j = 0; j < 2; j++)
    {
      for(var k = 0; k < shapes[i].length; k+=2)
      {
        vecflatnormals.push(new Vector3([(vecnormals[(12*i)+k+1].elements[0]-vecnormals[(12*i)+(k)].elements[0]), (vecnormals[(12*i)+k+1].elements[1]-vecnormals[(12*i)+(k)].elements[1]), (vecnormals[(12*i)+k+1].elements[2]-vecnormals[(12*i)+(k)].elements[2]) ]));

        faceverticesHolder.push(new Vector3([ ((shapes[i][k].elements[0]+shapes[i][k+1].elements[0]+shapes[i+1][k].elements[0]+shapes[i+1][k+1].elements[0])/4), ((shapes[i][k].elements[1]+shapes[i][k+1].elements[1]+shapes[i+1][k].elements[1]+shapes[i+1][k+1].elements[1])/4), ((shapes[i][k].elements[2]+shapes[i][k+1].elements[2]+shapes[i+1][k].elements[2]+shapes[i+1][k+1].elements[2])/4) ]));
        faceverticesHolder.push(new Vector3([ ((shapes[i][k].elements[0]+shapes[i][k+1].elements[0]+shapes[i+1][k].elements[0]+shapes[i+1][k+1].elements[0])/4), ((shapes[i][k].elements[1]+shapes[i][k+1].elements[1]+shapes[i+1][k].elements[1]+shapes[i+1][k+1].elements[1])/4), ((shapes[i][k].elements[2]+shapes[i][k+1].elements[2]+shapes[i+1][k].elements[2]+shapes[i+1][k+1].elements[2])/4) ]));

        vecflatnormals.push(new Vector3([(vecnormals[(12*i)+k+1].elements[0]-vecnormals[(12*i)+(k)].elements[0]), (vecnormals[(12*i)+k+1].elements[1]-vecnormals[(12*i)+(k)].elements[1]), (vecnormals[(12*i)+k+1].elements[2]-vecnormals[(12*i)+(k)].elements[2]) ]));
      }
    }
  }

  for(var i = 0; i < vecflatnormals.length; i++)
  {
  	flatnormals.push(vecflatnormals[i].elements[0]);
  	flatnormals.push(vecflatnormals[i].elements[1]);
  	flatnormals.push(vecflatnormals[i].elements[2]);
  }

  for(var i = 0; i < faceverticesHolder.length; i++)
  {
	facevertices.push(faceverticesHolder[i].elements[0]);
	facevertices.push(faceverticesHolder[i].elements[1]);
	facevertices.push(faceverticesHolder[i].elements[2]);
  }
}

function normalsSwitch()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(showNormals == true)
	{
		showNormals = false;
	}
	else
	{
		showNormals = true;
	}

	drawScene(gl);
}


function decideSmoothFlat()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(smooth == true)
	{
		smooth = false;
	}
	else
	{
		smooth = true;
	}

	drawScene(gl);
}


function ambientSwitch()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(ambLight == true)
	{
		ambLight = false;
	}
	else
	{
		ambLight = true;
	}

	drawScene(gl);
}


function specularSwitch()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(specLight == true)
	{
		specLight = false;
	}
	else
	{
		specLight = true;
	}

	drawScene(gl);
}


function switchProjection()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(ortho == true)
	{
		ortho = false;
	}
	else
	{
		ortho = true;
	}

	drawScene(gl);
}


function setnS()
{
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	var x = document.getElementById("myRange");
	glossFactor = x.value;
  	glossFactor = parseFloat(glossFactor);

  	for(var i = 0; i < meshObjs.length; i++)
  	{
  		meshObjs[i].NS = glossFactor;
  	}

  	drawScene(gl);
}


function setTex()
{
	var canvas, gl;
	var tempTex;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	var x = document.getElementById("myRange2");
	tempTex = x.value;
  	tempTex = parseFloat(tempTex);

  	if(selectedObj > -1)
  	{
  		meshObjs[selectedObj].texChoice = tempTex;
  	}

  	drawScene(gl);
}


function saveSOR()
{
  //Get name user wants to save file under.
  var fileName = prompt("Please enter a fileName", "obj.txt");
  var progVerts = [];
  var progInds = [];
  var cylCounts = [];
  var transMat = [];
  var rotmat = [];
  var counter = 0;

  for(var i = 0; i < meshObjs.length; i++)
  {
  	for(var j = 0; j < meshObjs[i].vertices.length; j++)
  	{
  		progVerts.push(meshObjs[i].vertices[j]);
  		counter++;
  	}

  	for(var j = 0; j < meshObjs[i].indices.length; j++)
  	{
  		progInds.push(meshObjs[i].indices[j]);
  	}

  	for(var j = 0; j < meshObjs[i].transformationMatrix.length; j++)
  	{
  		transMat.push(meshObjs[i].transformationMatrix[j]);
  	}
   	for(var j = 0; j < meshObjs[i].rotationMatrix.length; j++)
  	{
  		rotmat.push(meshObjs[i].rotationMatrix[j]);
  	}

  	cylCounts.push(counter);
  	counter = 0;
  }

  cylCounts = Float32Array.from(cylCounts);
  progVerts = Float32Array.from(progVerts);
  progInds = Float32Array.from(progInds);
  transMat = Float32Array.from(transMat);
  rotmat = Float32Array.from(rotmat);

  //Save our file
  if (fileName != null) 
  {
    //   Desc: This function translates the SOR Object into a downloadable blob
    saveFile(new SOR(fileName, progVerts, progInds, cylCounts, transMat, rotmat));
  }
}


function readSOR()
{
	clear();
	meshObjs = [];
	var canvas, gl;

	// Retrieve <canvas> element by name
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	var SORObj = readFile();

	var progVerts = Array.from(SORObj.vertices);
	var progInds = Array.from(SORObj.indexes);
	var cylCounts = Array.from(SORObj.cylCounts);
	var transMat = Array.from(SORObj.transMat);
	var rotMat = Array.from(SORObj.rotmat);

	var cylVertHolder = [];
	var cylIndHolder = [];
	var cylColHolder = [];
	var translationMAT = [];
	var rotMAT = [];

	for(var i = 0; i < cylCounts.length; i++)
	{
		console.log('cc count ' + i + ': ' + cylCounts[i]);
	}

	for(var i = 0; i < cylCounts.length; i++)
	{
		cylVertHolder = [];
		cylIndHolder = [];
		cylColHolder = [];
		transformationMAT = [];
		rotMAT = [];
		for(var j = 0; j < cylCounts[i]; j++)
		{
			cylVertHolder.push(progVerts[0]);
			progVerts.shift();
		}

		for(var j = 0; j < (cylCounts[i]/2); j++)
		{
			cylIndHolder.push(progInds[0]);
			progInds.shift();
		}

		console.log('transMat: ');
		for(var j = 0; j < 16; j++)
		{
			transformationMAT.push(transMat[0]);
			console.log(transMat[0]);
			transMat.shift();
		}

		console.log('rotMat: ')
		for(var j = 0; j < 16; j++)
		{
			rotMAT.push(rotMat[0]);
			console.log(rotMat[0]);
			rotMat.shift();
		}

		for(var j = 0; j < cylVertHolder.length; j+=3)
		{
			cylColHolder.push(0.0);
			cylColHolder.push(0.0);
			cylColHolder.push(0.0);
			cylColHolder.push((.988235-(i*.003921)));
		}

		//Rebuilding our shapes2 array
		for(var j = 0; j<((cylVertHolder.length)/72); j++)
		{
			surface = [];
			for(var k = 0; k < (72); k+=3)
			{
			  var ptHolder = new Vector3([cylVertHolder[(j*72)+k], cylVertHolder[(j*72)+k+1], cylVertHolder[(j*72)+k+2]]);
			  surface.push(ptHolder);
			}
			shapes.push(surface);
		}

		var meshO = new meshObj(shapes);
		meshO.vertices = cylVertHolder;
		meshO.indices = cylIndHolder;
		meshO.colors = cylColHolder;
		meshO.transformationMatrix = transformationMAT;
		meshO.rotationMatrix = rotMAT;

		//creating indices, storing inside the indices array, generating normals
		//iterating through each surface
		for(var j = 0; j < (shapes.length-1); j+=2)
		{
			//iterating through each pt of surface i
			for(var k = 0; k< shapes[j].length; k+=2)
			{
				generateNormal(j, k);   //generates the normal of our surface currently being created - This is Not yet fully functioning, so consider this Experimentation
			}
		}

		generateFlatNormal();
		generateSmoothNormal();

		var tempExpNormHolder = [];
		for(var j = 0; j < vecnormals.length; j++)
		{
			tempExpNormHolder.push(vecnormals[j].elements[0]);
			tempExpNormHolder.push(vecnormals[j].elements[1]);
			tempExpNormHolder.push(vecnormals[j].elements[2]);
		}
		meshO.surfaceNormals = tempExpNormHolder;
		meshO.flatNormals = flatnormals
		meshO.smoothNormals = smoothnormals;
		meshO.faceVertices = facevertices;
		meshO.KA = [0,0,0.2];
		meshO.KD = [1,0,0];
		meshO.KS = [0,1,0];
		meshO.NS = glossFactor;
		meshObjs.push(meshO);

	  	var texHold = [];
	  	for(var m=0; m < (cylVertHolder.length/144); m++)
	  	{
	  		for(var j=0; j<2; j++)
	  		{
		  		for(var k=0; k<12; k++)
		  		{
		  			texHold.push(j*1.0);
		  			texHold.push(1.0 - (k*0.08333));
		  			texHold.push(j*1.0);
		  			texHold.push(1.0 - ((k+1)*0.08333));
		  		}
		  	}
	  	}

	  	meshO.texCoords = texHold;
	  	console.log('tH size: ' + texHold.length + ', vert Size: ' + cylVertHolder.length);
	}

	drawScene(gl);
	clear();
}


function scaleObject(ev, gl, canvas)
{
	if(selectedObj > -1)
	{
		var mat = new Matrix4();
		var r = meshObjs[selectedObj].ratio;
		var xS, yS, zS;
		mat.elements = meshObjs[selectedObj].transformationMatrix;
		if(ev.deltaY < 0)
		{
			console.log('scrolling up');
			if(r + 0.1 < 2.1)
			{
				mat.scale((1/r),(1/r),(1/r));
				r = r + .1;
				mat.scale(r,r,r);
				meshObjs[selectedObj].ratio = r;
			}
		}
		else
		{
			console.log('scrolling down');
			if(r - 0.1 > 0.4)
			{
				mat.scale((1/r),(1/r),(1/r));
				r = r - .1;
				mat.scale(r,r,r);
				meshObjs[selectedObj].ratio = r;
			}
		}
		meshObjs[selectedObj].transformationMatrix = mat.elements;

		drawScene(gl);
	}
	else
	{
		if(moveCam == false)
		{
			zoom(ev, gl, canvas);
		}
		else
		{
			moveCamera(ev, gl, canvas);
		}
		
	}
}


function zoom(ev, gl, canvas)
{
	if(ortho == false)
	{
		if(ev.deltaY > 0)
		{
			if((FOV + 1) < 51)
			{
				FOV = FOV + 1;
			}
		}
		else
		{
			if((FOV - 1) > 4)
			{
				FOV = FOV - 1;
			}
		}
	}
	drawScene(gl);
}


function moveCamera(ev, gl, canvas)
{
	if(ev.deltaY > 0)
	{
		eZ = eZ + 5;
		NEAR = NEAR - 5;
		FAR = FAR - 5;
	}
	else
	{
		eZ = eZ - 5;
		NEAR = NEAR + 5;
		FAR = FAR + 5;
	}

	drawScene(gl);
}


function translateObjectInitial(ev, gl, canvas)
{
	var x = ev.clientX, y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
	var pixels = new Uint8Array(4); // Array for storing the pixel value
	var x_in_canvas = x - rect.left, y_in_canvas = canvas.height - (ev.clientY - rect.top);
	gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	mouseD = true;

	if(selectedObj != -1)
	{
		if(selectedObj == (252 - pixels[3]))
		{
			if(ev.button == 0)
			{
				console.log('left click down');
				iX = x_in_canvas;
				iY = y_in_canvas;
				inTranslation = true;
				leftC = true;
			}
			else if(ev.button == 1)
			{
				console.log('middle click down');
				iZ = y_in_canvas;
				inTranslation = true;
				middleC = true;
			}
			else if(ev.button == 2)
			{
				iX = x_in_canvas;
				iY = y_in_canvas;
				inRotation = true;
				rightC = true;
			}
		}
		else
		{
			click(ev, gl, canvas);
			clickOff = true;
		}
	}
	else
	{
		iX = x_in_canvas;
		iY = y_in_canvas;
		nX = iX;
		nY = iY;

		if(ev.button == 0)
		{
			leftC = true;
		}
	}
}


function translateObjectFinal(ev, gl, canvas)
{
	var x = ev.clientX, y = ev.clientY, z = ev.clientZ;
	var rect = ev.target.getBoundingClientRect();
	var x_in_canvas = x - rect.left, y_in_canvas = canvas.height - (ev.clientY - rect.top);
	var obj
	mouseD = false;
	if(selectedObj > -1)
	{
		obj = meshObjs[selectedObj];
	}
	if(inTranslation == true)
	{
		if(ev.button == 0)
		{
			console.log('left click up');
			var xT = x_in_canvas - iX;
			var yT = y_in_canvas - iY;
			
			obj.transformationMatrix[12] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[12] + xT))));
			obj.transformationMatrix[13] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[13] + yT))));

		}
		else if(ev.button == 1)
		{
			console.log('middle click up');
			var zT = y_in_canvas - iZ;
			obj.transformationMatrix[14] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[14] + zT))));
		}

		drawScene(gl);

		inTranslation = false;
		clear();
	}
	else if(inRotation == true)
	{
		if(ev.button == 2)
		{
			console.log('right mouse up');
			var fX = x_in_canvas - iX;
			var fY = y_in_canvas - iY;
			var ANGLEZ = 0.2*fX;
			var ANGLEX = 0.2*fY;

			var mat = new Matrix4();
			var rotmat = new Matrix4();

			mat.elements = obj.transformationMatrix;
			rotmat.elements = obj.rotationMatrix;

			mat = mat.rotate(ANGLEZ, 0.0,0.0,1.0);
			mat = mat.rotate(ANGLEX, 1.0,0.0,0.0);
			rotmat = rotmat.rotate(ANGLEZ, 0.0,0.0,1.0);
			rotmat = rotmat.rotate(ANGLEX, 1.0,0.0,0.0);
			obj.transformationMatrix = mat.elements;
			obj.rotationMatrix = rotmat.elements;
			drawScene(gl);
		}
		inRotation = false;
		clear();
	}
	else if (selectedObj == -1)
	{
		if(ev.button == 0)
		{
			var cX = x_in_canvas - iX;
			var cY = y_in_canvas - iY;
			var difX = x_in_canvas - nX;
			var difY = y_in_canvas - nY;

			if(difX > -0.05 && difX < 0.05 && difY > -0.05 && difY < 0.05 || currentlyGenerating == true)
			{
				click(ev, gl, canvas);
			}
			else
			{
				if(clickOff != true)
				{
					eX = Math.max(-500.0, Math.min(500.0, eX - cX));
					eY = Math.max(-500.0, Math.min(500.0, eY - cY));
					aX = Math.max(-500.0, Math.min(500.0, aX - cX));
					aY = Math.max(-500.0, Math.min(500.0, eY - cY));
					L = Math.max(-1000.0, Math.min(0.0, L - cX));
					R = Math.max(0.0, Math.min(1000.0, R - cX));
					T = Math.max(0.0, Math.min(1000.0, T - cY));
					B = Math.max(-1000.0, Math.min(0.0, B - cY));
					drawScene(gl);
					leftC = false;
					nX = x_in_canvas;
					xY = y_in_canvas;
				}
				else
				{
					clickOff = false;
				}
			}
		}
		else if(ev.button == 1)
		{
			if(moveCam == true)
			{
				moveCam = false
			}
			else
			{
				moveCam = true;
			}
		}
		else
		{
			click(ev, gl, canvas);
			clear();
		}
	}

}


function handleMovement(ev, gl, canvas)
{
	var x = ev.clientX, y = ev.clientY, z = ev.clientZ;
	var rect = ev.target.getBoundingClientRect();
	var x_in_canvas = x - rect.left, y_in_canvas = canvas.height - (ev.clientY - rect.top);
	var obj
	if(selectedObj > -1)
	{
		obj = meshObjs[selectedObj];
		if(inTranslation == true)
		{
			if(leftC == true)
			{
				console.log('ev.button: ' + ev.button);
				var xT = x_in_canvas - iX;
				var yT = y_in_canvas - iY;
				iX = x_in_canvas;
				iY = y_in_canvas;
				
				obj.transformationMatrix[12] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[12] + xT))));
				obj.transformationMatrix[13] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[13] + yT))));

			}
			else if(middleC == true)
			{
				console.log('ev.button: ' + ev.button);
				var zT = y_in_canvas - iZ;
				iZ = y_in_canvas;
				obj.transformationMatrix[14] = Math.max(-500, (Math.min(500.0, (obj.transformationMatrix[14] + zT))));
			}

			drawScene(gl);
		}
		else if(inRotation == true)
		{
			obj = meshObjs[selectedObj];
			if(rightC == true)
			{
				var fX = x_in_canvas - iX;
				var fY = y_in_canvas - iY;
				iX = x_in_canvas;
				iY = y_in_canvas;
				var ANGLEZ = 0.2*fX;
				var ANGLEX = 0.2*fY;

				console.log('Movement change of x:' + fX + ', y:' + fY + ' yields a angle change of z: ' + ANGLEZ + ', x:' + ANGLEX);

				var mat = new Matrix4();
				var rotmat = new Matrix4();

				mat.elements = obj.transformationMatrix;
				rotmat.elements = obj.rotationMatrix;

				mat = mat.rotate(ANGLEZ, 0.0,0.0,1.0);
				mat = mat.rotate(ANGLEX, 1.0,0.0,0.0);
				rotmat = rotmat.rotate(ANGLEZ, 0.0,0.0,1.0);
				rotmat = rotmat.rotate(ANGLEX, 1.0,0.0,0.0);
				obj.transformationMatrix = mat.elements;
				obj.rotationMatrix = rotmat.elements;
				drawScene(gl);
			}
		}
	}
	else
	{
		if(leftC == true)
		{
			var cX = x_in_canvas - iX;
			var cY = y_in_canvas - iY;
			iX = x_in_canvas;
			iY = y_in_canvas;
			var difX = x_in_canvas - nX;
			var difY = y_in_canvas - nY;

			if(currentlyGenerating == false && mouseD == true)
			{
				console.log('difX: ' + difX + 'difY: ' + difY);
				if(difX < -0.5 || difX > 0.5 || difY < -0.5 || difY < 0.5)
				{
					if(clickOff != true)
					{
						eX = Math.max(-500.0, Math.min(500.0, eX - cX));
						eY = Math.max(-500.0, Math.min(500.0, eY - cY));
						aX = Math.max(-500.0, Math.min(500.0, aX - cX));
						aY = Math.max(-500.0, Math.min(500.0, eY - cY));
						L = Math.max(-1000.0, Math.min(0.0, L - cX));
						R = Math.max(0.0, Math.min(1000.0, R - cX));
						T = Math.max(0.0, Math.min(1000.0, T - cY));
						B = Math.max(-1000.0, Math.min(0.0, B - cY));
						drawScene(gl);
					}
				}
			}
			else
			{
				move(ev, gl, canvas);
			}
		}
	}
}