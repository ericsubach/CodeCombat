/*
 * http://codecombat.com/play/level/gridmancer#
 */

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

for (var tY = 0; tY + kTileSize < kGrid.length; tY += kTileSize)
{
   for (var tX = 0; tX + kTileSize < kGrid[0].length; tX += kTileSize)
   {
      var tOccupied = kGrid[tY][tX].length > 0;
      
      if (!tOccupied)
      {
         //this.addRect(x + kTileSize / 2, y + kTileSize / 2, kTileSize, kTileSize);
         findLargestRect(x, y);
         
         tAnchorPoint = new Point(x, y);
         tLargestRectangle = findLargestRectangleFromAnchorPoint(kGrid, tAnchorPoint);
      }
   }
}

//this.say("(0,0) = " + kGrid[11][4].length);
//this.wait();
//this.say("(2,2) = " + kGrid[12][4].length);
//this.wait();

//==============================================================================

// all of my functions are based with the grid (0, 0) based in the upper-left and increasing right/down.

// avoids giving a rectangle containing taken squares
// throws exception if anchor point is taken
function findLargestRectangleFromAnchorPointAvoidTaken(aGrid, aAnchorPoint)
{
}


// doesn't look at if squares are taken by rectangles
function findLargestRectangleFromAnchorPoint(aGrid, aAnchorPoint)
{
   tCardinalWallsArray = findNearestWallsInAllDirections(aGrid, aAnchorPoint);
   tNorth = tCardinalWallsArray[0];
   tSouth = tCardinalWallsArray[1];
   tWest  = tCardinalWallsArray[2];
   tEast  = tCardinalWallsArray[3];

   tQuadrant1 = new Quadrant(aAnchorPoint, new Point(tEast.x, tNorth.y));
   tQuadrant2 = new Quadrant(aAnchorPoint, new Point(tEast.x, tSouth.y));
   tQuadrant3 = new Quadrant(aAnchorPoint, new Point(tWest.x, tSouth.y));
   tQuadrant4 = new Quadrant(aAnchorPoint, new Point(tWest.x, tNorth.y));
   
   tQuadrant1Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant1.otherVertexPoint,  1, -1, Math.max);
   tQuadrant2Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant2.otherVertexPoint,  1,  1, Math.min);
   tQuadrant3Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant3.otherVertexPoint, -1,  1, Math.min);
   tQuadrant4Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant4.otherVertexPoint, -1, -1, Math.max);
   
   tRect1And2 = largestCombinedRectangleHorizontalEdge(tQuadrant1Rects, tQuadrant2Rects);
   tRect2And3 = largestCombinedRectangleVerticalEdge(tQuadrant3Rects, tQuadrant2Rects);
   tRect3And4 = largestCombinedRectangleHorizontalEdge(tQuadrant4Rects, tQuadrant3Rects);
   tRect4And1 = largestCombinedRectangleVerticalEdge(tQuadrant4Rects, tQuadrant1Rects);
   
   tCombinedRectsArray = new Array(tRect1And2, tRect2And3, tRect3And4, tRect4And1);
   tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray);
   
   return tMaxAreaRectangle;
}

function maxAreaRectangle(aRectanglesArray)
{
   tMaxAreaRectangle = null;
   tMaxArea = -1;
   
   for (tIdx = 0; tIdx < aRectanglesArray.length; tIdx++)
   {
      if (aRectanglesArray[tIdx].area() > tMaxArea)
      {
         tMaxAreaRectangle = aRectanglesArray[tIdx];
         tMaxArea = aRectanglesArray[tIdx].area();
      }
   }
   
   return tMaxAreaRectangle;
}

function largestCombinedRectangleHorizontalEdge(aRectanglesNorth, aRectanglesSouth)
{

}

function largestCombinedRectangleVerticalEdge(aRectanglesWest, aRectanglesEast)
{

}

function findNearestWallsInAllDirections(aGrid, aAnchorPoint)
{
   tNorth = findNearestWallInDirection(aGrid, aAnchorPoint,  0, -1);
   tSouth = findNearestWallInDirection(aGrid, aAnchorPoint,  0,  1);
   tWest  = findNearestWallInDirection(aGrid, aAnchorPoint, -1,  0);
   tEast  = findNearestWallInDirection(aGrid, aAnchorPoint,  1,  0);
   
   tArray = new Array();
   tArray.push(tNorth);
   tArray.push(tSouth);
   tArray.push(tWest);
   tArray.push(tEast);
   
   return tArray;
}

function findNearestWallInDirection(aGrid, aAnchorPoint, aHorizontalIncrement, aVerticalIncrement)
{
   for (tX = aAnchorPoint.x, tY = aAnchorPoint.y;
        !isWall(tX, tY);
        tX += aHorizontalIncrement, tY += aVerticalIncrement)
   {
      // Do nothing.
   }
   
   return new Point(tX, tY);
}

// not optimized for speed
// optimized for largest rectangle
function findAllRectsInQuadrant(aGrid, aAnchorPoint, aOtherVertexPoint, aSweepHorizontal, aSweepVertical, aVerticalMinOrMaxFunction)
{
   if (isWall(aAnchorPoint.x, aAnchorPoint.y))
   {
      throw new Exception("Anchor point must not be a wall.")
   }

   tVerticalMinOrMaxSoFar = aOtherVertexPoint.y + aSweepVertical; // FIXME this plus part?
   tRectangles = new Array();
   
   for (tX = aAnchorPoint.x; tX != aOtherVertexPoint.x; tX += aSweepHorizontal)
   {
      for (tY = aAnchorPoint.y; tY != aOtherVertexPoint.y; tY += aSweepVertical)
      {
         if (isWall(aGrid, tX, tY))
         {
            tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY);
            break;
         }
      }
      
      // FIXME obo ?
      // FIXME constructor args vs. what is passed here. they differ
      tRectangle = new Rectangle(aAnchorPoint.x, tAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - 1);
      tRectangles.add(tRectangle);
   }
   
   return tRectangles;
}

function isWall(aGrid, aX, aY)
{
   return (aGrid[tY][tX].length == 1);
}

function isNotTakenByRectangle(aGrid, aX, aY)
{
   throw new Exception("Unimplemented");
}

// not wall and not taken
//function isFree
function isNotWallAndNotTakenByRectangle(aGrid, aX, aY)
{
   return (!isWall(aGrid, aX, aY) && isNotTakenByRectangle(aGrid, aX, aY));
}

//==============================================================================

/**
 * Point class.
 */
function Point(aX, aY)
{
   this.x = aX;
   this.y = aY;
}

/**
 * Rectangle class.
 */
function Rectangle()
{
   this.x = 0;
   this.y = 0;
   this.width = 0;
   this.height = 0;
   
   this.area = function()
   {
      return (this.width * this.height);
   };
}

/**
 * Quadrant class.
 */
function Quadrant(aAnchorPoint, aOtherVertexPoint)
{
   this.anchorPoint      = aAnchorPoint;
   this.otherVertexPoint = aOtherVertexPoint;
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
   
   /*
   * Find the nearest wall or taken square in each direction
   * Go across each 
   */
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
