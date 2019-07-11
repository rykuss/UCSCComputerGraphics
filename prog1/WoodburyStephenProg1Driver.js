//SHADERS
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
  '}\n';


//Global Arrays: For managing verticies and indices used throughout the program
var linePoints = []; // Array of coordinates for the polyline that is not completed
                     // Note: Just LCPoints could have been used, but an intended feature in the future 
                     // is the Ability to draw multiple polylines. This array becomes necessary there.
var RCPoints = [];   // Array for right click mouse positions
var LCPoints = [];   // Array for left click mouse positions
var shapes = [];     // Array for storing Cylinder Circle Bases
var shapes2 = []     // Array for Cylinder Surfaces from the shapes array, but the disjoint surfaces are now merged. Used for when shapes is complete.
var indices = [];    // Array for storing what connections to make between what verts in the vertex Buffer 
var normals = [];    // Used to store normal line points, two pts. per normal. 
var indexHolder;     // Used to store indexes (in typed array format), for the vertex shader
var vertices;        // Used to store Vertexes (in typed array format), for the vertex shader

//NOTE: If you want to generate normal vectors to look at (They're not correctly proportioned nor are they separately colored/generated). Uncomment line 389 with the function enableNormals(temp).


//MAIN
function main() 
{
  //Set up file input
  setupIOSOR("fileName");

  // Retrieve <canvas> element by name
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //Custom function for initializing the shaders and buffers.
  initializeBuffersandShaders(gl);

  // Getting location of Attribute Variable a_Position and storing inside local Variable: a_Position
  // This allows the use of the location of WEBGL's a_Position through the local Variable: a_Position
  // to send Vertex Locations to the Vertex_Shader.
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  //Call screenRefreshLines, a function to clear the canvas and to draw our polylines if we've any vertices. 
  //Details for screenRefreshLines are given below, including details on the arguments. 
  screenRefreshLines(gl, a_Position, 0);

  // Register function (event handler) to be called on a mouse press(Left, Right, or otherwise) : this is also the function where if you right click, cylinder generation will start from here
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };

  // Register function (event handler) to be called on a mouse move
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
}



/***************MAIN FUNCTIONS CLICK, MOVE, GENERATE..., DRAW...***************************************************************/

/* click(event, gl, element, location) 
     event - Event object, stores mouse location info
     gl - rendering context
     element - Specifies canvas element
     location - location of an Attribute Variable in WEBGL's System

   Notes: Function used to handle when the user clicks the canvas (right, left, or otherwise)
   The function determines if the mouse click was a left or right click or otherwise and 
   performes specific actions respectively.
   LC: Updates LCPoints array, echos location
   RC: Updates RCPoints array, echos location, prevents dialog box, prints coord of finished polyline, generates cylinders from spine, print normal vector information
   all: updated linePoints array using converted coordinates, draws line as it stands. If there is a complete polyline/cylinder, any click will reset everything
*/
function click(ev, gl, canvas, a_Position) 
{
  //Determining if there is a complete polyline already. If so, if you click, clear everything for a new polyline
  if(RCPoints.length > 0)
  {
    linePoints = []; // Array of coordinates for the polyline that is not completed
                         // Note: Just LCPoints could have been used, but an intended feature in the future 
                         // is the Ability to draw multiple polylines. This array becomes necessary there.
    RCPoints = [];   // Array for right click mouse positions
    LCPoints = [];   // Array for left click mouse positions
    shapes = [];     // Array for storing Cylinder Circle Bases
    shapes2 = []     // Array for Cylinder Surgaces from shapes, but the disjoint surfaces are now merged. Used for when shapes is complete.
    indices = [];    // Array for storing what connections to make between what verts in the vertex Buffer 
    normals = [];    // Used to store normal line points, two pts. per normal. 
  }
  else
  {
    var tempLPExpHolder = []; //used for holding the expanded version of linePoints, for easier conversion to a typed array for the vertex shader.
    var n = 0; //n here is used to represent the size of the LP Array, the num of vertices to draw lines between. 

    //Converting coordinates passed into function. Canvas -> WEBGL
    x = calculateWEBGLXCoordinate(ev, canvas);
    y = calculateWEBGLYCoordinate(ev, canvas);

    // Store the coordinates to linePoints array on LC or RC
    if(ev.button != 1)
    {
      linePoints.push([x,y]);
    }

    // Set n, the number of vertices to draw lines between
    n = linePoints.length;

    // Filling tempLPExpHolder with expanded version of coord's in linePoints, for conversion to a typed array for the vertex shader.
    for(var i = 0; i < (linePoints.length*2); i+=2)
    {
      tempLPExpHolder[i] = linePoints[i/2][0];
      tempLPExpHolder[i+1] = linePoints[i/2][1];
    }

    // Create a Float32Array from linePoints(WEBGL needs typed arrays)
    vertices = Float32Array.from(tempLPExpHolder); 

    // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER. 
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable(a_Position, Specify how many numbers are to be read from the buffer per vertex(2) 
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Call screenRefreshLines function to clear canvas and draw our known lines.
    screenRefreshLines(gl, a_Position, n);
    
    // Determine if the mouse button clicked is the left mouse button
    if(ev.button == 0)
    {
      //Update LCPoints array
      LCPoints.push(x);
      LCPoints.push(y);

      //Echo Click Location
      console.log('Left Click Mouse Position(WebGL Coordinates): (' + x + ', ' + y + ')');
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

      // Update RCPoints Array
      RCPoints.push(x);
      RCPoints.push(y);

      // Echo Click Location
      console.log('Right Click Mouse Position(WebGL Coordinates): (' + x + ', ' + y + ')');

      // Read off all vertices that make up the now completed polyline.
      console.log('Polyline Completed, Printing List of Coordinates for Polyline: ');

      for(var i = 0; i < (linePoints.length); i += 1)
      {
        console.log('(' + linePoints[i][0] + ', ' + linePoints[i][1] + ')');
      }

      //update console
      console.log('Now generating a SOR...');

      generateCylinder(a_Position, gl);   //once we're done creating our spine of polyline, create and draw our cylinders.

      // printing normal information
      console.log('Cylinder generation complete, now printing normal vector information[n#: pt1(x,y,z)  pt2(x,y,z) | where our line is drawn from pt1 to pt2]:');
      for(var i = 0; i < normals.length; i+=2)
      {
        console.log('n' + ((i/2) + 1) + ': pt1(' + normals[i].elements[0] + ', ' + normals[i].elements[1] + ', ' + normals[i].elements[2] + ')  pt2(' + normals[i+1].elements[0] + ', ' + normals[i+1].elements[1] + ', ' + normals[i+1].elements[2] + ')');
      }

      console.log('Note: Normals created as cylinder is generated, so n1 is related to the normal of the rectangle formed by the verts 0, 1, 12, and 13: verts of surfaces 0 and 1, surfaces being the bases of each cylinder(from shapes2 array)');
    }
    //Determine if a mouse click event was triggered but the button pushed wasn't right or left
    else
    {
      console.log('Error Recognizing click Trigger');
      return -1;
    }
  }
}


/* move(event, gl, element, location) 
     event - Event object, stores mouse location info
     gl - rendering context
     element - Specifies canvas element
     location - location of an Attribute Variable in WEBGL's System

   Notes: Function called whenever the user moves their mouse cursor on the canvas. 
   If the poly line is not yet completed and if there is at least one point in the poly line,
   then the function will take the currently known points of the poly line and it will take
   the mouse position(not a confirmed clicked point) and draws line segments between all of
   those locations. Since the mouse position(not confirmed) isn't stored in the linePoints
   array, the next time the cursor moves, that point will have been forgotten. The canvas will
   have been cleared, and the lines will have been redrawn (with a new mouse position), creating
   the illusion of a rubberbanding line. 
*/
function move(ev, gl, canvas, a_Position)
{
  //Determine if the polyline is not completed and if there is at least one point in the polyline.
  if(RCPoints.length == 0 && (linePoints.length) > 0)
  {
    var tempLPExpHolder = []; //used to hold expanded version of LP and of the extra mouse location
    var n;  //n here is used to represent the number of verts that need connectuions drawn between them

    //Converting coordinates passed into function. Canvas -> WEBGL
    x = calculateWEBGLXCoordinate(ev, canvas);
    y = calculateWEBGLYCoordinate(ev, canvas);
    
    //Expand LP into tempLPExpHolder
    for(var i = 0; i < (linePoints.length*2); i+=2)
    {
      tempLPExpHolder[i] = linePoints[i/2][0];
      tempLPExpHolder[i+1] = linePoints[i/2][1];
    }

    // Take the mouse position Vertex, and push it to the temp array. 
    tempLPExpHolder.push(x); 
    tempLPExpHolder.push(y);

    // Create a Float32Array from tempLPExpHolder(WEBGL needs typed arrays)
    vertices = Float32Array.from(tempLPExpHolder); 

    //set n, the num of verts to drawn lines between
    n = ((tempLPExpHolder.length) / 2)

    // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER. Specify Usage(DYNAMIC_DRAW) for efficiency
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable(a_Position, Specify how many numbers are to be read from the buffer per vertex(2) 
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Call screenRefreshLines function to clear canvas and draw our known lines + mouse position(unconfirmed)
    screenRefreshLines(gl, a_Position, n);
  }
} 


/* generateCylinder(a_Position, gl) 
     location - location of an Attribute Variable in WEBGL's System
     gl - rendering context

   Notes: Function when called creates a series of circular surfaces rotated around our spine points
          12 pts per circular surface. Once completed, the function then merges disjoint circular bases.
          Afterwards, drawCylinderObjects() is called. 
*/
function generateCylinder(a_Position, gl)
{
  var radius = .1;  //5% of the smallest dimension of the canvas (2*.05 = .1 : WEBGL Coordinates range from -1 to 1 on either axis, scales to given dimensions)
  var arbitraryMat; //Set later as a tool for helping to rotate a vector
  var translateMat; //Set later as a tool for helping to translate a vector
  var combinedMat;  //Set later as a supertool for both translating and rotating a vector
  var resultVector; //Set later to hold a rotated and translated point that needs adding to our surface
  var surface;      //surface array to store our coord's per circle surface (one circle per surface array, later pushed in shapes array once surface pts are generated)
  var pointVector;  //will be used for our initial vector (spine pt's x,y coord's with a z value equal to radius)
  var axisVector;   //Will later be set to hold a vector representation of an axis of rotation, used for generating rotated points of each base of a cylinder, pre-joining.

  //iterate through each line/spine
  for(var i = 1; i < linePoints.length; i+=1)
  {
    //create our axisVector
    axisVector = new Vector3([linePoints[i-1][0] - linePoints[i][0], linePoints[i-1][1] - linePoints[i][1], 0]);

    //Decides which surface to construct (first pt surface, then second pt surface)
    for(var j = 0; j < 2; j += 1)
    {
      surface = []; //used to store our coord's per cylinder base, specifically circular bases (before merging disconnects)

      //used in relation to for loop directly above, will generate a pointVector based on which surface we're working with
      if(j == 0)
      {
        pointVector = new Vector3([linePoints[i-1][0], linePoints[i-1][1], radius]);
      }
      else
      {
        pointVector = new Vector3([linePoints[i][0], linePoints[i][1], radius]);
      }

      //push our initial vector (defined above) onto our surface array
      surface.push(pointVector);

      //this for loop generates 11 different points (first already generated for us)
      for(var k = 0; k < 11; k++)
      {
        arbitraryMat = new Matrix4();   //used as a tool for rotation
        translateMat = new Matrix4();   //used as a tool for translation

        translateMat.translate(pointVector.elements[0], pointVector.elements[1], 0);    //specifies the translation to be made when a vector is multiplied to this matrix
        arbitraryMat.rotate((30*(k+1)), axisVector.elements[0], axisVector.elements[1], axisVector.elements[2]);  //specifies the rotation to be made when a vector is multiplied to this matrix
       
        combinedMat = translateMat.multiply(arbitraryMat);  //This is s super tool matrix, where when a vector is multiplied to this matrix, it is translated and rotated as specified by arbMat and tranMat.
        resultVector = combinedMat.multiplyVector3(new Vector3([0,0,radius])); //creating a pt needed for our surface with the comMat
        
        surface.push(resultVector);   //once our pt is generated, push it onto our surface array
      }

      //once all 12 pts are on the surface array, push surface array onto shapes array (global)
      shapes.push(surface);
    }
  }

  //once our shapes array is completed, call mergeDisjoints() to merge disconnected cylinder bases together, new shapes array is now shapes2
  mergeDisjoints();

  //once all surfaces are generated (bases of cylinders), call the function that creates our indices, fills our buffers, and ultimately draws our cylinders. 
  drawCylinderObjects(a_Position, gl);
}


/* drawCylinderObjects(a_Position, gl) 
     location - location of an Attribute Variable in WEBGL's System
     gl - rendering context

   Notes: Function when called will load up our vertices array for the vertex buffer and it will create our indices array linking up each base of our cylinders.
          Our normals are also calculated from this function. Once complete, our cylinders are then drawn through calling screenRefreshCylinders.
*/
function drawCylinderObjects(a_Position, gl)
{
  var temp = [];  //Array used for pushing our expanded verticies onto. Makes for easier conversion to a typed array for our vertex buffer. 
  var n;          //n in this function will represent the number of vertices that need lines drawn between them inside indexHolder. 
  var FSIZE;      //Used for vertexAttribPointer

  //Pushing vertices(expanded) onto temp array
  for(var i = 0; i < shapes2.length; i++)
  {
    for(var j = 0; j < shapes2[i].length; j++)
    {
      temp.push(shapes2[i][j].elements[0]);
      temp.push(shapes2[i][j].elements[1]);
      temp.push(shapes2[i][j].elements[2]);
    }
  }

  //creating indices, storing inside the indices array, generating normals
  //iterating through each surface
  for(var i = 0; i < (shapes2.length-1); i++)
  {
    var counter = 0;  //used for determining when we are creating the last surface of a cylinder between two cylinder bases (different math required).

    //iterating through each pt of surface i
    for(var j = 0; j < shapes2[i].length; j++)
    {
      //If this is not the last surface of a cylinder, do this
      if(counter < 11)
      {
        generateNormal(i, j, 0);   //generates the normal of our surface currently being created - This is Not yet fully functioning, so consider this Experimentation

        indices.push((12*(i+1))+j); 
        indices.push(j+(12*i)); 
        indices.push(j+(12*i)+1); 
        indices.push((12*(i+1))+1+j); 
        indices.push((12*(i+1))+j); 

        counter++;
      }
      //do this if you're generating the last surface of a cylinder.
      else
      {
        generateNormal(i, j, 1);   //generates the normal of our surface currently being created - This is Not yet fully functioning, so consider this Experimentation

        indices.push((12*(i+1))+j); 
        indices.push(j+(12*i));
        indices.push((12*i));
        indices.push((12*(i+1)));
        indices.push((12*(i+1))+j);
      }
    }
  }

  //TESTING NORMAL VECTOR CREATION - UNCOMMENT TO VIEW NORMALS FOR A NEW CYLINDER (NOT LOADED)
  enableNormals(temp);

  //n here represents the number of vertices that need lines drawn between them
  n = indices.length;

  //create Uint16Array from indices (for index Buffer Compatibility)
  indexHolder = Uint16Array.from(indices);

  //create Float32Array from temp (for vertexBuffer Compatibility)
  vertices = Float32Array.from(temp);

  //create FSIZE variable based on size of Bytes per vertex element in vertices. Used in vertexAttribPointer.
  FSIZE = vertices.BYTES_PER_ELEMENT;

  //Write data(indices) into the buffer object at target gl.ELEMENT_ARRAY_BUFFER. 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexHolder, gl.STATIC_DRAW);

  // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER.
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable(a_Position) Specify how many numbers are to be read from the buffer per vertex(3) 
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);

  // Clears screen (color and depth) and draws out our cylinders. 
  screenRefreshCylinders(gl, a_Position, n)
}



/***************HELPER FUNCTIONS: screenRefreshLines, CALCU...X, CALCU...Y***************************************/

/* screenRefreshLines(gl, location, size)
    gl - Rendering Context
    location - location of an Attribute Variable in WEBGL's System
    size - # of vertices in linePoints Array/in active polyine(polyline yet to be finished)

   Notes: Function made for ease of Canvas Clearing and for ease of polyline Drawing
*/
function screenRefreshLines(gl, a_Position, n)
{
  // Specify the color for clearing <canvas>, in this case, white
  gl.clearColor(1, 1, 1, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Ensuring that a single point has been placed on the canvas so that unnecessary actions aren't performed
  if(n > 0)
  {
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Draw to the Canvas: Series of connected lines, start at vertex 0, call shaders n times.
    gl.drawArrays(gl.LINE_STRIP, 0, n);

    // Disable the assignment to a_Position Variable
    // Technically not necessary, but defensive programming
    // Disabling allows the vertices to be modified and resent to the vertex buffer
    gl.disableVertexAttribArray(a_Position);
  }
}


/* screenRefreshCylinders(gl, location, size)
    gl - Rendering Context
    location - location of an Attribute Variable in WEBGL's System
    size - # of vertices in linePoints Array/in active polyine(polyline yet to be finished)

   Notes: Function made for ease of Canvas Clearing and for ease of Cylinder Drawing
*/
function screenRefreshCylinders(gl, a_Position, n)
{
  // Specify the color for clearing <canvas>, in this case, white
  gl.clearColor(1, 1, 1, 1);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Ensuring that a single index has been created so that unnecessary actions aren't performed
  if(n > 0)
  {
    //Enable Depth test
    gl.enable(gl.DEPTH_TEST);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Draw the Cylinders
    gl.drawElements(gl.LINES, n, gl.UNSIGNED_SHORT, 0);

    //defensive programming
    gl.disable(gl.DEPTH_TEST);
    gl.disableVertexAttribArray(a_Position);
  }
}


/* calculateWEBGLXCoordinate(gl, element) 
     gl - rendering context
     element - Specifies canvas element

   Notes: Function made for ease of converting X-Coordinates from a Canvas system to a WEBGL System
*/
function calculateWEBGLXCoordinate(ev, canvas)
{
  var x = ev.clientX; // x coordinate of a mouse pointer, with respect to the canvas system.
  var rect = ev.target.getBoundingClientRect() ; //position of canvas in client area

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2); //converting

  return x; //returned value is the X-coord in the WEBGL system
}


/* calculateWEBGLYCoordinate(gl, element) 
     gl - rendering context
     element - Specifies canvas element

   Notes: Function made for ease of converting Y-Coordinates from a Canvas system to a WEBGL System
*/
function calculateWEBGLYCoordinate(ev, canvas)
{
  var y = ev.clientY; // y coordinate of a mouse pointer, with respect to the canvas system
  var rect = ev.target.getBoundingClientRect() ; //position of canvas in client area

  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); //converting

  return y; //returned value is the Y-coord in the WEBGL System
}

/* saveSOR() 

   Notes: Function saves our SOR into an object Blob file with a given name. 
*/
function saveSOR()
{
  //Get name user wants to save file under.
  var fileName = prompt("Please enter a fileName", "obj.txt");

  //Save our file
  if (fileName != null) 
  {
    //   Desc: This function translates the SOR Object into a downloadable blob
    saveFile(new SOR(fileName, vertices, indexHolder));
  }
}

/* readSOR() 

   Notes: Read in a blob file selected by the user and display it 
*/
function readSOR()
{
  //read in fileName (call readFile() function from ioSOR.js). Store our blob inside SORobj
  var SORObj = readFile();
  var n;  //n in this function will represent the number of vertices that need lines drawn between them inside indexHolder. 
  var FSIZE //Used for vertexAttribPointer
  var canvas = document.getElementById('webgl');   // Retrieve <canvas> element by name
  var a_Position; //Used later for holding location of vertex shader's a_Position.

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //allocate data to vertices and indexHolder of our SOR. 
  vertices = Float32Array.from(SORObj.vertices);
  indexHolder = Uint16Array.from(SORObj.indexes);

  // Set n, the number of vertexes that need connections drawn between them
  n = indexHolder.length

  //create FSIZE variable based on size of Bytes per vertex element in vertices. Used in vertexAttribPointer.
  FSIZE = vertices.BYTES_PER_ELEMENT;

  //Custom function for initializing the shaders and buffers.
  initializeBuffersandShaders(gl)

  // Getting location of Attribute Variable a_Position and storing inside local Variable: a_Position
  // This allows the use of the location of WEBGL's a_Position through the local Variable: a_Position
  // to send Vertex Locations to the Vertex_Shader.
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  //Write data(indices) into the buffer object at target gl.ELEMENT_ARRAY_BUFFER. 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexHolder, gl.STATIC_DRAW);

  // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER.
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable(a_Position) Specify how many numbers are to be read from the buffer per vertex(3) 
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);

  // Clears screen (color and depth) and draws out our cylinders. 
  screenRefreshCylinders(gl, a_Position, n)
}


/* initializeBuffersandShaders(gl) 
     gl - rendering context

   Notes: Function made for ease of initilizing shaders and for creating buffers for both importing SORs and generating new SORs. 
*/
function initializeBuffersandShaders(gl)
{
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  //Creating a Buffer for vertices inside the WEBGL System. 
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  //Creating a Buffer for indices inside the WEBGL System. 
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target, ie, state that the Vertex_Buffer will hold Vertex Locations
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Bind the buffer object to target, ie, state that the Element_Array_Buffer will hold what the indices(Vertices to connect)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}


/* mergeDisjoints() 

   Notes: Function made for filling the shapes2 array with cylinder-surfaces that are joined when applicable. 
*/
function mergeDisjoints()
{
  var pointNum = 1;   //Used for keeping track of pt. Number for merging bases
  var axisVector1;    //Used as a vector represenation of different aor's. 
  var axisVector2;    //Used as a vector represenation of different aor's. 
  var newSurfacePoint; //Used to store new Surface Pts being generated in Vector Form
  var m1, b1, m2, b2, x, y; //Used for calculating specifics of merging surfaces

  //push first surface onto shapes2 array as we aren't merging the ends
  shapes2.push(shapes[0]);

  //iterating through second shape to third to last shape, for merging
  for(var i = 1; i < (shapes.length-2); i+=2)
  {
    var newSurface = [];

    //create our axisVector1 - first surface
    axisVector1 = new Vector3([linePoints[pointNum-1][0] - linePoints[pointNum][0], linePoints[pointNum-1][1] - linePoints[pointNum][1], 0]);

    //create our axisVector2 - second surface
    axisVector2 = new Vector3([linePoints[pointNum][0] - linePoints[pointNum+1][0], linePoints[pointNum][1] - linePoints[pointNum+1][1], 0]);

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

    //increment the point number we're working with
    pointNum++;
  }

  //push last surface onto shapes2 array as we aren't merging the ends
  shapes2.push(shapes[(shapes.length-1)]);
}


/* generateNormal(i, j, e) 
     i - Surface Number in shapes2 array, 0-indexed
     j - Pt. Number of surface i in shapes2 Array, 0-indexed
     e - determines if we're working with the last surface of a cylinder: 0 - No, 1 - Yes

   Notes: Function needs more rigorous testing. Count this as an early prototype of a later implementation. The math needs review
          The goal of the function is to generate two points. p1 and p2. both of which will be pushed onto 
          the normals array. a normal is intended to be drawn between p1 and p2.
*/
function generateNormal(i, j, e)
{
  var v1, v2, N, pt1, pt2; //used for normal calculations

  //Create vector 1
  v1 = new Vector3([(shapes2[i+1][j].elements[0] - shapes2[i][j].elements[0]), (shapes2[i+1][j].elements[1] - shapes2[i][j].elements[1]), (shapes2[i+1][j].elements[2] - shapes2[i][j].elements[2])]);

  //Create vector 2, calculation depeneds on if you're working with the last surface of a cylinder or not. also determine midway pt. 
  if(e == 0)
  {
    v2 = new Vector3([ (shapes2[i+1][j].elements[0] - shapes2[i+1][j+1].elements[0]), (shapes2[i+1][j].elements[1] - shapes2[i+1][j+1].elements[1]), (shapes2[i+1][j].elements[2] - shapes2[i+1][j+1].elements[2])]);

	//Calculate our midway pt. between our 4 indices (Where our base pt. of our normal is going to go)
  	pt1 = new Vector3([((shapes2[i][j].elements[0] + shapes2[i][j+1].elements[0] + shapes2[i+1][j].elements[0] + shapes2[i+1][j+1].elements[0]) / 4) , ((shapes2[i][j].elements[1] + shapes2[i][j+1].elements[1] + shapes2[i+1][j].elements[1] + shapes2[i+1][j+1].elements[1]) / 4) , ((shapes2[i][j].elements[2] + shapes2[i][j+1].elements[2] + shapes2[i+1][j].elements[2] + shapes2[i+1][j+1].elements[2]) / 4)]);
  }
  else
  {
	v2 = new Vector3([(shapes2[i+1][j].elements[0] - shapes2[i+1][0].elements[0]), (shapes2[i+1][j].elements[1] - shapes2[i+1][0].elements[1]), (shapes2[i+1][j].elements[2] - shapes2[i+1][0].elements[2])]);
	
	//Calculate our midway pt. between our 4 indices (Where our base pt. of our normal is going to go)
  	pt1 = new Vector3([((shapes2[i][j].elements[0] + shapes2[i][0].elements[0] + shapes2[i+1][j].elements[0] + shapes2[i+1][0].elements[0]) / 4) , ((shapes2[i][j].elements[1] + shapes2[i][0].elements[1] + shapes2[i+1][j].elements[1] + shapes2[i+1][0].elements[1]) / 4) , ((shapes2[i][j].elements[2] + shapes2[i][0].elements[2] + shapes2[i+1][j].elements[2] + shapes2[i+1][0].elements[2]) / 4)]);
  }

  //Calculate Normal Resulting from v1 x v2
  N = new Vector3([((v1.elements[1]*v2.elements[2])-(v1.elements[2]*v2.elements[1])), ((v1.elements[2]*v2.elements[0])-(v1.elements[0]*v2.elements[2])), ((v1.elements[0]*v2.elements[1])-(v1.elements[1]*v2.elements[0]))]);

  //Normalize our normal vector
  N.normalize();

  //calculate our next pt. of our normal vector
  pt2 = new Vector3([(pt1.elements[0] - (N.elements[0] / 4)), (pt1.elements[1] - (N.elements[1] / 4) ), (pt1.elements[2] - (N.elements[2] / 4) ) ]);

  //push normal pts onto normals array. 
  normals.push(pt1);
  normals.push(pt2);
}


/* enableNormals(temp) 
     temp - array of vertices used to figure out what vertices are related to normals

   Notes: This is a function still in test. It's meant for ease of creating normal indices. Do not consider this complete, this is a prototype
*/
function enableNormals(temp)
{
  // ti = temporary index: one vertex after the last vertex of our cylinders.
  var ti = (temp.length / 3);

  //Push our normal vert's onto our temp array (expanded)
  for(var i = 0; i < normals.length; i++)
  {
    temp.push(normals[i].elements[0]);
    temp.push(normals[i].elements[1]);
    temp.push(normals[i].elements[2]);
  }

  //generate the indices related to our verts of our normals
  for(var i = ti; i < (temp.length/ 3); i+=2 )
  {
    indices.push(i);
    indices.push(i+1);
  }
}