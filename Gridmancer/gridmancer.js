// Fill the empty space with the minimum number of rectangles.
// (Rectangles should not overlap each other or walls.)
// The grid size is 1 meter, but the smallest wall/floor tile is 4 meters.
// If you can do better than one rectangle for every tile, let us know!
// We'll help you find a programming job (if you want one).
// Check the blue guide button at the top for more info.
// Press Contact below to report success if you want a job!
// Just include your multiplayer link in the contact email.
// Make sure to sign up on the home page to save your code.

var kGrid = this.getNavGrid().grid;
var kTileSize = 4;

for (var y = 0; y + kTileSize < kGrid.length; y += kTileSize)
{
   for (var x = 0; x + kTileSize < kGrid[0].length; x += kTileSize)
   {
      var occupied = kGrid[y][x].length > 0;
      if (!occupied)
      {
         //this.addRect(x + kTileSize / 2, y + kTileSize / 2, kTileSize, kTileSize);
         //this.say("current tile xy is (" + x + "," + y + ")");
         //this.wait();  // Hover over the timeline to help debug!
         
         findLargestRect(x, y);
      }
   }
}
this.say("(0,0) = " + kGrid[11][4].length);
this.wait();
this.say("(2,2) = " + kGrid[12][4].length);
this.wait();

//==============================================================================

function Rectangle ()
{
   this.x = 0;
   this.y = 0;
   this.width = 0;
   this.height = 0;
}

tRect = new Rectangle();
tRect.x = 2;

// * simple solver
// * fewest rectangles solver

function findLargestRectNoOverlap(aX, aY)
{
   //kGrid
   
   // * find longest in all 4 directions
   // * scale back when scanning in a direction if not all are available or hit a wall
}

// grid starts at lower left 0-based index (increase as go up/right)
// grid represents where walls are
// 0 = no wall
// 1 = wall

// simple solution
//================
// * do a cross and find largest section from the current position that is rectangle and open
// * skip already taken squares

// complex solution
//=================
// * do the cross
// * consider each rectangle, regardless of whether already taken
// * find each rectangle this new one overlaps.
// * find the new way to break this up
// * if the resulting number of rectangles is smaller, choose this new solution
