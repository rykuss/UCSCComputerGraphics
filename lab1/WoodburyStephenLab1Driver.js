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
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';


//Global Arrays: For Click Locations and current PolyLine Vertices
var linePoints = []; // Array of coordinates for the polyline that is not completed
                     // Note: Just LCPoints could have been used, but an intended feature in the future 
                     // is the Ability to draw multiple polylines. This array becomes necessary there.
var RCPoints = [];   // Array for right click mouse positions
var LCPoints = [];   // Array for left click mouse positions


//MAIN
function main() 
{
  // Retrieve <canvas> element by name
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Getting location of Attribute Variable a_Position and storing inside local Variable: a_Position
  // This allows the use of the location of WEBGL's a_Position through the local Variable: a_Position
  // to send Vertex Locations to the Vertex_Shader.
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  //Creating a Buffer inside the WEBGL System. 
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target, ie, state that the Vertex_Buffer will hold Vertex Locations
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Specify the color for clearing <canvas>, in this case, white
  gl.clearColor(1, 1, 1, 1);

  //Call screenRefresh, a function to clear the canvas and to draw our polylines if we've any vertices. 
  //Details for screenRefresh are given below, including details on the arguments. 
  screenRefresh(gl, a_Position, 0);

  // Register function (event handler) to be called on a mouse press(Left, Right, or otherwise)
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };

  // Register function (event handler) to be called on a mouse move
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
}



/***************MAIN FUNCTIONS CLICK AND MOVE***************************************************************/

/* click(event, gl, element, location) 
     event - Event object, stores mouse location info
     gl - rendering context
     element - Specifies canvas element
     location - location of an Attribute Variable in WEBGL's System

   Notes: Function used to handle when the user clicks the canvas (right, left, or otherwise)
   The function determines if the mouse click was a left or right click or otherwise and 
   performes specific actions respectively.
   LC: Updates LCPoints array, echos location
   RC: Updates RCPoints array, echos location, prevents dialog box, prints coord of finished polyline
   all: updated linePoints array using converted coordinates, draws line as it stands

   function rendered effectively functionless after the user has right-clicked the canvas, which completes
   the polyline. Program currently only able to draw one polyline. 
*/
function click(ev, gl, canvas, a_Position) 
{
  //Determining if there is a complete polyline already. 
  if(RCPoints.length == 0)
  {
    //Converting coordinates passed into function. Canvas -> WEBGL
    x = calculateWEBGLXCoordinate(ev, canvas);
    y = calculateWEBGLYCoordinate(ev, canvas);

    // Store the coordinates to linePoints array
    linePoints.push([x,y]);

    var tempLPExpHolder = [];
    for(var i = 0; i < (linePoints.length*2); i+=2)
    {
      tempLPExpHolder[i] = linePoints[i/2][0];
      tempLPExpHolder[i+1] = linePoints[i/2][1];
    }

    // Create a Float32Array from linePoints(WEBGL needs typed arrays)
    var vertices = Float32Array.from(tempLPExpHolder); 

    // Set n, the number of vertices to draw lines between
    var n = linePoints.length;

    // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER. Specify Usage(DYNAMIC_DRAW) for efficiency
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable(a_Position, Specify how many numbers are to be read from the buffer per vertex(2) 
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Call screenRefresh function to clear canvas and draw our known lines.
    screenRefresh(gl, a_Position, n);
    
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

   function rendered effectively functionless after the user has right-clicked the canvas, which completes
   the polyline. Program currently only able to draw one polyline. 
*/
function move(ev, gl, canvas, a_Position)
{
  //Determine if the polyline is not completed and if there is at least one point in the polyline.
  if(RCPoints.length == 0 && (linePoints.length) > 0)
  {
    //Converting coordinates passed into function. Canvas -> WEBGL
    x = calculateWEBGLXCoordinate(ev, canvas);
    y = calculateWEBGLYCoordinate(ev, canvas);
    
    var tempLPExpHolder = [];
    for(var i = 0; i < (linePoints.length*2); i+=2)
    {
      tempLPExpHolder[i] = linePoints[i/2][0];
      tempLPExpHolder[i+1] = linePoints[i/2][1];
    }

    // Take the mouse positoon Vertex, and push it to the temp array. 
    tempLPExpHolder.push(x); 
    tempLPExpHolder.push(y);

    // Create a Float32Array from tempLPExpHolder(WEBGL needs typed arrays)
    var vertices = Float32Array.from(tempLPExpHolder); 
    var n = ((tempLPExpHolder.length) / 2)

    // Write data(vertices) into the buffer object at target gl.ARRAY_BUFFER. Specify Usage(DYNAMIC_DRAW) for efficiency
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable(a_Position, Specify how many numbers are to be read from the buffer per vertex(2) 
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Call screenRefresh function to clear canvas and draw our known lines + mouse position(unconfirmed)
    screenRefresh(gl, a_Position, n);
  }
} 



/***************HELPER FUNCTIONS: SCREENREFRESH, CALCU...X, CALCU...Y***************************************/

/* screenRefresh(gl, location, size)
    gl - Rendering Context
    location - location of an Attribute Variable in WEBGL's System
    size - # of vertices in linePoints Array/in active polyine(polyline yet to be finished)

   Notes: Function made for ease of Canvas Clearing and for ease of polyline Drawing
   Function is only optimized for drawing a single polyline.
*/
function screenRefresh(gl, a_Position, n)
{
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