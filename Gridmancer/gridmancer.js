/*
 * http://codecombat.com/play/level/gridmancer#
 */

/*
* grid starts at lower left 0-based index (increase as go up/right)
* grid represents where walls are
* 0 = no wall
* 1 = wall

# complex solution
* do the cross
* consider each rectangle, regardless of whether already taken
* find each rectangle this new one overlaps.
* find the new way to break this up
* if the resulting number of rectangles is smaller, choose this new solution
*/


/*
* should work for the example level but may fail if the level is not aligned to a 4x4 grid style.
* assumption: bounded by a wall on all sides, otherwise out-of-bounds errors will occur
* all of my functions are based with the grid (0, 0) based in the upper-left and increasing right/down.
*/

//==============================================================================

//this.say("(0,0) = " + kGrid[11][4].length);
//this.wait();
//this.say("(2,2) = " + kGrid[12][4].length);
//this.wait();

//==============================================================================

/*
 * Fill the empty space with the minimum number of rectangles.
 * (Rectangles should not overlap each other or walls.)
 * The grid size is 1 meter, but the smallest wall/floor tile is 4 meters.
 * If you can do better than one rectangle for every tile, let us know!
 * We'll help you find a programming job (if you want one).
 * Check the blue guide button at the top for more info.
 * Press Contact below to report success if you want a job!
 * Just include your multiplayer link in the contact email.
 * Make sure to sign up on the home page to save your code.
 */

//==============================================================================

// Test data
var kIsTest = true;

function getGrid()
{
   if (kIsTest)
   {
      return [
             [[1], [1], [1], [1], [1]],
             [[1],  [],  [],  [], [1]],
             [[1],  [],  [],  [], [1]],
             [[1],  [],  [],  [], [1]],
             [[1], [1], [1], [1], [1]]
             ];
   }
   else
   {
      return this.getNavGrid().grid;
   }
}

//==============================================================================

var kGrid       = getGrid();
var kRectangles = new Array();
var kTileSize   = 4;

for (var tY = 0; tY + kTileSize < kGrid.length; tY += kTileSize)
{
   for (var tX = 0; tX + kTileSize < kGrid[0].length; tX += kTileSize)
   {
      var tNotOccupied = isNotWallAndNotTakenByRectangle(kGrid, tX, tY);
      
      if (tNotOccupied)
      {
         tAnchorPoint = new Point(x, y);
         try
         {
            tLargestRectangle = findLargestRectangleFromAnchorPointAvoidTaken(kGrid, aRectangles, tAnchorPoint);

            if (tLargestRectangle)
            {
               myAddRectangle(aRectangles, tLargestRectangle);
            }
         }
         catch (aException)
         {
            // TODO
         }
      }
   }
}

// At this point the entire grid should be filled with rectangles.

//==============================================================================

function myAddRectangle(aRectangles, aRectangle)
{
   this.addRect(aRectangle.x + (aRectangle.width / 2),
                aRectangle.y + (aRectangle.height / 2),
                aRectangle.width,
                aRectangle.height);
   aRectangles.push(aRectangle);
}


/*
 * * avoids giving a rectangle containing taken squares
 * * throws exception if anchor point is taken
 */
function findLargestRectangleFromAnchorPointAvoidTaken(aGrid, aRectangles, aAnchorPoint)
{
   tCardinalCollisionsArray = findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint);
   tNorth = tCardinalCollisionsArray[0];
   tSouth = tCardinalCollisionsArray[1];
   tWest  = tCardinalCollisionsArray[2];
   tEast  = tCardinalCollisionsArray[3];

   tQuadrant1 = new Quadrant(aAnchorPoint, new Point(tEast.x, tNorth.y));
   tQuadrant2 = new Quadrant(aAnchorPoint, new Point(tEast.x, tSouth.y));
   tQuadrant3 = new Quadrant(aAnchorPoint, new Point(tWest.x, tSouth.y));
   tQuadrant4 = new Quadrant(aAnchorPoint, new Point(tWest.x, tNorth.y));
   
   tQuadrant1Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant1.otherVertexPoint,  1, -1, Math.max);
   tQuadrant2Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant2.otherVertexPoint,  1,  1, Math.min);
   tQuadrant3Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant3.otherVertexPoint, -1,  1, Math.min);
   tQuadrant4Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant4.otherVertexPoint, -1, -1, Math.max);
   
   tRect1And2 = largestCombinedRectangleQuadrant1And2(tQuadrant1Rects, tQuadrant2Rects);
   tRect2And3 = largestCombinedRectangleQuadrant2And3(tQuadrant2Rects, tQuadrant3Rects);
   tRect3And4 = largestCombinedRectangleQuadrant3And4(tQuadrant3Rects, tQuadrant4Rects);
   tRect4And1 = largestCombinedRectangleQuadrant1And4(tQuadrant1Rects, tQuadrant4Rects);
   
   tCombinedRectsArray = new Array(tRect1And2, tRect2And3, tRect3And4, tRect4And1);
   tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray);
   
   return tMaxAreaRectangle;
}


/*
 * doesn't look at if squares are taken by rectangles
 */
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
         tMaxArea = tMaxAreaRectangle.area();
      }
   }
   
   return tMaxAreaRectangle;
}


/*
 * relies on the fact that the anchor point is shared to work correctly
 */
function largestCombinedRectangleQuadrant1And2(aRectanglesQuadrant1, aRectanglesQuadrant2)
{
   tPotentialRectangles = aRectanglesQuadrant1.concat(aRectanglesQuadrant2);

   /*
    * Try all combinations of rectangles from each quadrant whose x values align,
    * then choose the largest one.
    */
   for (tI = 0; tI < aRectanglesQuadrant1.length; tI++)
   {
      tFirst = aRectanglesQuadrant1[tI];
      for (tJ = 0; tJ < aRectanglesQuadrant2.length; tJ++)
      {
         tSecond = aRectanglesQuadrant2[tJ];
         if (tFirst.x2 == tSecond.x2)
         {
            // top-left to bottom-right
            tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant2And3(aRectanglesQuadrant2, aRectanglesQuadrant3)
{
   tPotentialRectangles = aRectanglesQuadrant2.concat(aRectanglesQuadrant3);

   /*
    * Try all combinations of rectangles from each quadrant whose y values align,
    * then choose the largest one.
    */
   for (tI = 0; tI < aRectanglesQuadrant3.length; tI++)
   {
      tFirst = aRectanglesQuadrant3[tI];
      for (tJ = 0; tJ < aRectanglesQuadrant2.length; tJ++)
      {
         tSecond = aRectanglesQuadrant2[tJ];
         if (tFirst.y2 == tSecond.y2)
         {
            // top-left to bottom-right
            tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant3And4(aRectanglesQuadrant3, aRectanglesQuadrant4)
{
   tPotentialRectangles = aRectanglesQuadrant3.concat(aRectanglesQuadrant4);

   /*
    * Try all combinations of rectangles from each quadrant whose x values align,
    * then choose the largest one.
    */
   for (tI = 0; tI < aRectanglesQuadrant4.length; tI++)
   {
      tFirst = aRectanglesQuadrant4[tI];
      for (tJ = 0; tJ < aRectanglesQuadrant3.length; tJ++)
      {
         tSecond = aRectanglesQuadrant3[tJ];
         if (tFirst.x2 == tSecond.x2)
         {
            // top-left to bottom-right
            tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant1And4(aRectanglesQuadrant1, aRectanglesQuadrant4)
{
   tPotentialRectangles = aRectanglesQuadrant1.concat(aRectanglesQuadrant4);

   /*
    * Try all combinations of rectangles from each quadrant whose y values align,
    * then choose the largest one.
    */
   for (tI = 0; tI < aRectanglesQuadrant4.length; tI++)
   {
      tFirst = aRectanglesQuadrant4[tI];
      for (tJ = 0; tJ < aRectanglesQuadrant1.length; tJ++)
      {
         tSecond = aRectanglesQuadrant1[tJ];
         if (tFirst.y2 == tSecond.y2)
         {
            // top-left to bottom-right
            tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


/*
 * relies on the fact that the anchor point is shared to work correctly
 */
function largestCombinedRectangleVerticalEdge(aRectanglesWest, aRectanglesEast)
{

}


function findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint)
{
   tNorth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0, -1);
   tSouth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0,  1);
   tWest  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, -1,  0);
   tEast  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  1,  0);
   
   tArray = new Array();
   tArray.push(tNorth);
   tArray.push(tSouth);
   tArray.push(tWest);
   tArray.push(tEast);
   
   return tArray;
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


function findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, aHorizontalIncrement, aVerticalIncrement)
{
   for (tX = aAnchorPoint.x, tY = aAnchorPoint.y;
        !isWall(aGrid, tX, tY) && isNotTakenByRectangle(aRectangles, tX, tY);
        tX += aHorizontalIncrement, tY += aVerticalIncrement)
   {
      // Do nothing.
   }
   
   return new Point(tX, tY);
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


/*
 * * not optimized for speed; optimized for largest rectangle
 */
function findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, aOtherVertexPoint, aSweepHorizontal, aSweepVertical, aVerticalMinOrMaxFunction)
{
   if (isWall(aAnchorPoint.x, aAnchorPoint.y) || !isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y))
   {
      throw new Exception("Anchor point must not be a wall.")
   }

   tVerticalMinOrMaxSoFar = aOtherVertexPoint.y + aSweepVertical; // FIXME this plus part?
   tRectangles = new Array();
   
   for (tX = aAnchorPoint.x; tX != aOtherVertexPoint.x; tX += aSweepHorizontal)
   {
      for (tY = aAnchorPoint.y; tY != aOtherVertexPoint.y; tY += aSweepVertical)
      {
         if (isWall(aGrid, tX, tY) || !isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y))
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


/*
 * * not optimized for speed; optimized for largest rectangle
 */
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


function isNotTakenByRectangle(aRectangles, aX, aY)
{
   //throw new Exception("Unimplemented");
   for (tIdx = 0; tIdx < aRectangles.length; tIdx++)
   {
      if (aRectangles[tIdx].contains(aX, aY))
      {
         return false;
      }
   }
   
   return true;
}


function isNotWallAndNotTakenByRectangle(aGrid, aRectangles, aX, aY)
{
   return (!isWall(aGrid, aX, aY) && isNotTakenByRectangle(aRectangles, aX, aY));
}

//==============================================================================

/**
 * Point class.
 */
function Point(aX, aY)
{
   this.x = aX;
   this.y = aY;
   
   this.toString = function ()
   {
      return '(' + this.x + ', ' + this.y + ')';
   };
}


/**
 * Rectangle class.
 */
function Rectangle(aX1, aY1, aX2, aY2)
{
   this.x = aX1;
   this.y = aY1;
   
   this.x2 = aX2;
   this.y2 = aY2;
   
   this.width = this.x2 - this.x;
   this.height = this.y2 - this.y;
   
   //this.x2 = this.x + this.width;
   //this.y2 = this.y + this.height;
   
   this.area = function()
   {
      return (this.width * this.height);
   };
   
   this.contains = function(aX, aY)
   {
      return (this.x < aX && aX < (this.x + this.width) &&
              this.y < aY && aY < (this.y + this.height));
   };

   this.containsPoint = function(aPoint)
   {
      return this.contains(aPoint.x, aPoint.y);
   };
   
   this.toString = function()
   {
      return '[(' + this.x + ', ' + this.y + '), ' + '(' + this.x2 + ', ' + this.y2 + ')]';
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
