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

* there is a problem with the was I represented the problem. It has to do with
  representation of coordinates. I really want to represent each coordinate as
  the center of a square. That is opposed to the other representation where a
  coordinate has no width, height. Thus, in both systems the equivalent unit
  square is:
  - [(1, 1), (1, 1)] equal to (1, 1)
  - [(1, 1), (2, 2)]

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

function writeDebug(aString)
{
   if (kIsTest)
   {
      document.write(aString + '<br />');
   }
   else
   {
      // Do nothing.
   }
}

//==============================================================================

var kGrid       = getGrid();
var kRectangles = new Array();
var kTileSize   = 1;
var kIncrement  = 0;

writeDebug(kGrid.length);
writeDebug(kGrid[0].length);

function main()
{
   for (var tY = 0; tY + kIncrement < kGrid.length; tY += kTileSize)
   {
      for (var tX = 0; tX + kIncrement < kGrid[0].length; tX += kTileSize)
      {
         writeDebug('');
         writeDebug('Checking point = ' + new Point(tX, tY));
         var tNotOccupied = isNotWallAndNotTakenByRectangle(kGrid, kRectangles, tX, tY);
         
         if (tNotOccupied)
         {
            var tAnchorPoint = new Point(tX, tY);
            writeDebug('Point is not occupied: ' + tAnchorPoint);

            // try
            // {
               var tLargestRectangle = findLargestRectangleFromAnchorPointAvoidTaken(kGrid, kRectangles, tAnchorPoint);

               if (tLargestRectangle)
               {
                  writeDebug('The largest rectangle was = ' + tLargestRectangle);
                  myAddRectangle(kRectangles, tLargestRectangle);
               }
            // }
            // catch (aException)
            // {
            //    // TODO
            // }
         }
      }
   }

   // At this point the entire grid should be filled with rectangles.

   writeDebug('===================================');
   writeDebug('There are ' + kRectangles.length + ' rectangles = ' + kRectangles);
}

//==============================================================================

function myAddRectangle(aRectangles, aRectangle)
{
   writeDebug('Adding rectangle = ' + aRectangle);
   if (!kIsTest)
   {
      this.addRect(aRectangle.x + (aRectangle.width / 2),
                   aRectangle.y + (aRectangle.height / 2),
                   aRectangle.width,
                   aRectangle.height);
   }
   aRectangles.push(aRectangle);
}


/*
 * * avoids giving a rectangle containing taken squares
 * * throws exception if anchor point is taken
 */
function findLargestRectangleFromAnchorPointAvoidTaken(aGrid, aRectangles, aAnchorPoint)
{
   var tCardinalCollisionsArray = findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint);
   var tNorth = tCardinalCollisionsArray[0];
   var tSouth = tCardinalCollisionsArray[1];
   var tWest  = tCardinalCollisionsArray[2];
   var tEast  = tCardinalCollisionsArray[3];
   writeDebug('Collision array: ' + '[north = ' + tNorth.y + '], ' + '[south = ' + tSouth.y + '], ' + '[west = ' + tWest.x + '], ' + '[east = ' + tEast.x + ']');

   var tQuadrant1 = new Quadrant(aAnchorPoint, new Point(tEast.x, tNorth.y));
   var tQuadrant2 = new Quadrant(aAnchorPoint, new Point(tEast.x, tSouth.y));
   var tQuadrant3 = new Quadrant(aAnchorPoint, new Point(tWest.x, tSouth.y));
   var tQuadrant4 = new Quadrant(aAnchorPoint, new Point(tWest.x, tNorth.y));
   
   writeDebug('searching quadrant 1');
   var tQuadrant1Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant1.otherVertexPoint,  1, -1, Math.max);
   writeDebug('searching quadrant 2');
   var tQuadrant2Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant2.otherVertexPoint,  1,  1, Math.min);
   writeDebug('searching quadrant 3');
   var tQuadrant3Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant3.otherVertexPoint, -1,  1, Math.min);
   writeDebug('searching quadrant 4');
   var tQuadrant4Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant4.otherVertexPoint, -1, -1, Math.max);
   
   var tRect1And2 = largestCombinedRectangleQuadrant1And2(tQuadrant1Rects, tQuadrant2Rects);
   var tRect2And3 = largestCombinedRectangleQuadrant2And3(tQuadrant2Rects, tQuadrant3Rects);
   var tRect3And4 = largestCombinedRectangleQuadrant3And4(tQuadrant3Rects, tQuadrant4Rects);
   var tRect4And1 = largestCombinedRectangleQuadrant1And4(tQuadrant1Rects, tQuadrant4Rects);
   
   var tCombinedRectsArray = new Array(tRect1And2, tRect2And3, tRect3And4, tRect4And1);
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant1Rects);
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant2Rects);
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant3Rects);
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant4Rects);
   var tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray);
   
   return tMaxAreaRectangle;
}


/*
 * doesn't look at if squares are taken by rectangles
 */
function findLargestRectangleFromAnchorPoint(aGrid, aAnchorPoint)
{
   var tCardinalWallsArray = findNearestWallsInAllDirections(aGrid, aAnchorPoint);
   var tNorth = tCardinalWallsArray[0];
   var tSouth = tCardinalWallsArray[1];
   var tWest  = tCardinalWallsArray[2];
   var tEast  = tCardinalWallsArray[3];

   var tQuadrant1 = new Quadrant(aAnchorPoint, new Point(tEast.x, tNorth.y));
   var tQuadrant2 = new Quadrant(aAnchorPoint, new Point(tEast.x, tSouth.y));
   var tQuadrant3 = new Quadrant(aAnchorPoint, new Point(tWest.x, tSouth.y));
   var tQuadrant4 = new Quadrant(aAnchorPoint, new Point(tWest.x, tNorth.y));
   
   var tQuadrant1Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant1.otherVertexPoint,  1, -1, Math.max);
   var tQuadrant2Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant2.otherVertexPoint,  1,  1, Math.min);
   var tQuadrant3Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant3.otherVertexPoint, -1,  1, Math.min);
   var tQuadrant4Rects = findAllRectsInQuadrant(aGrid, aAnchorPoint, tQuadrant4.otherVertexPoint, -1, -1, Math.max);
   
   var tRect1And2 = largestCombinedRectangleHorizontalEdge(tQuadrant1Rects, tQuadrant2Rects);
   var tRect2And3 = largestCombinedRectangleVerticalEdge(tQuadrant3Rects, tQuadrant2Rects);
   var tRect3And4 = largestCombinedRectangleHorizontalEdge(tQuadrant4Rects, tQuadrant3Rects);
   var tRect4And1 = largestCombinedRectangleVerticalEdge(tQuadrant4Rects, tQuadrant1Rects);
   
   var tCombinedRectsArray = new Array(tRect1And2, tRect2And3, tRect3And4, tRect4And1);
   var tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray);
   
   return tMaxAreaRectangle;
}


function maxAreaRectangle(aRectanglesArray)
{
   var tMaxAreaRectangle = null;
   var tMaxArea = -1;
   
   for (var tIdx = 0; tIdx < aRectanglesArray.length; tIdx++)
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
   var tPotentialRectangles = new Array();

   /*
    * Try all combinations of rectangles from each quadrant whose x values align,
    * then choose the largest one.
    */
   for (var tI = 0; tI < aRectanglesQuadrant1.length; tI++)
   {
      var tFirst = aRectanglesQuadrant1[tI];
      for (var tJ = 0; tJ < aRectanglesQuadrant2.length; tJ++)
      {
         var tSecond = aRectanglesQuadrant2[tJ];
         if (tFirst.x2 == tSecond.x2)
         {
            // top-left to bottom-right
            var tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant2And3(aRectanglesQuadrant2, aRectanglesQuadrant3)
{
   var tPotentialRectangles = new Array();

   /*
    * Try all combinations of rectangles from each quadrant whose y values align,
    * then choose the largest one.
    */
   for (var tI = 0; tI < aRectanglesQuadrant3.length; tI++)
   {
      var tFirst = aRectanglesQuadrant3[tI];
      for (var tJ = 0; tJ < aRectanglesQuadrant2.length; tJ++)
      {
         var tSecond = aRectanglesQuadrant2[tJ];
         if (tFirst.y2 == tSecond.y2)
         {
            // top-left to bottom-right
            var tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant3And4(aRectanglesQuadrant3, aRectanglesQuadrant4)
{
   var tPotentialRectangles = new Array();

   /*
    * Try all combinations of rectangles from each quadrant whose x values align,
    * then choose the largest one.
    */
   for (var tI = 0; tI < aRectanglesQuadrant4.length; tI++)
   {
      var tFirst = aRectanglesQuadrant4[tI];
      for (var tJ = 0; tJ < aRectanglesQuadrant3.length; tJ++)
      {
         var tSecond = aRectanglesQuadrant3[tJ];
         if (tFirst.x2 == tSecond.x2)
         {
            // top-left to bottom-right
            var tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
            tPotentialRectangles.push(tTestRectangle);
         }
      }
   }
   
   return maxAreaRectangle(tPotentialRectangles);
}


function largestCombinedRectangleQuadrant1And4(aRectanglesQuadrant1, aRectanglesQuadrant4)
{
   var tPotentialRectangles = new Array();

   /*
    * Try all combinations of rectangles from each quadrant whose y values align,
    * then choose the largest one.
    */
   for (var tI = 0; tI < aRectanglesQuadrant4.length; tI++)
   {
      var tFirst = aRectanglesQuadrant4[tI];
      for (var tJ = 0; tJ < aRectanglesQuadrant1.length; tJ++)
      {
         var tSecond = aRectanglesQuadrant1[tJ];
         if (tFirst.y2 == tSecond.y2)
         {
            // top-left to bottom-right
            var tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2);
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
   var tNorth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0, -1);
   var tSouth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0,  1);
   var tWest  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, -1,  0);
   var tEast  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  1,  0);
   
   var tArray = new Array();
   tArray.push(tNorth);
   tArray.push(tSouth);
   tArray.push(tWest);
   tArray.push(tEast);
   
   return tArray;
}


function findNearestWallsInAllDirections(aGrid, aAnchorPoint)
{
   var tNorth = findNearestWallInDirection(aGrid, aAnchorPoint,  0, -1);
   var tSouth = findNearestWallInDirection(aGrid, aAnchorPoint,  0,  1);
   var tWest  = findNearestWallInDirection(aGrid, aAnchorPoint, -1,  0);
   var tEast  = findNearestWallInDirection(aGrid, aAnchorPoint,  1,  0);
   
   var tArray = new Array();
   tArray.push(tNorth);
   tArray.push(tSouth);
   tArray.push(tWest);
   tArray.push(tEast);
   
   return tArray;
}


function findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, aHorizontalIncrement, aVerticalIncrement)
{
   var tX;
   var tY;
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
   var tX;
   var tY;
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
   if (isWall(aGrid, aAnchorPoint.x, aAnchorPoint.y) || !isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y))
   {
      throw new Exception("Anchor point must not be a wall.")
   }

   writeDebug('Finding all rectangles in quadrant between two points. [anchor = ' + aAnchorPoint + '], [other = ' + aOtherVertexPoint + ']');

   var tVerticalMinOrMaxSoFar = aOtherVertexPoint.y;// + aSweepVertical; // FIXME this plus part?
   var tRectangles = new Array();
   writeDebug('vertical min/max started out as = ' + tVerticalMinOrMaxSoFar);
   
   for (var tX = aAnchorPoint.x; tX != (aOtherVertexPoint.x /*+ aSweepHorizontal*/); tX += aSweepHorizontal)
   {
      for (var tY = aAnchorPoint.y; tY != (aOtherVertexPoint.y /*+ aSweepVertical*/); tY += aSweepVertical)
      {
         if (isWall(aGrid, tX, tY) || !isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y))
         {
            //writeDebug('original min/max = ' + tVerticalMinOrMaxSoFar);
            //writeDebug('tY original = ' + tY);
            tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY - aSweepVertical); // looking back on the previous square. could be problamatic
            break;
         }
         else
         {
            //tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY);
         }
      }

      writeDebug('the vertical min/max is now = ' + tVerticalMinOrMaxSoFar);
      var tRectangle = rectangleFromAnchorPointToOtherPoint(aAnchorPoint.x, aAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - aSweepVertical);// + aSweepVertical);
      writeDebug('adding rectangle to quadrant = ' + tRectangle);
      tRectangles.push(tRectangle);
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

   var tVerticalMinOrMaxSoFar = aOtherVertexPoint.y + aSweepVertical; // FIXME this plus part?
   var tRectangles = new Array();
   
   for (var tX = aAnchorPoint.x; tX != aOtherVertexPoint.x; tX += aSweepHorizontal)
   {
      for (var tY = aAnchorPoint.y; tY != aOtherVertexPoint.y; tY += aSweepVertical)
      {
         if (isWall(aGrid, tX, tY))
         {
            tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY);
            break;
         }
      }
      
      // FIXME obo ?
      //tRectangle = new Rectangle(aAnchorPoint.x, tAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - 1);
      var tRectangle = rectangleFromAnchorPointToOtherPoint(aAnchorPoint.x, tAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - 1);
      tRectangles.add(tRectangle);
   }
   
   return tRectangles;
}


function isWall(aGrid, aX, aY)
{
   return (aGrid[aY][aX].length == 1);
}


function isNotTakenByRectangle(aRectangles, aX, aY)
{
   for (var tIdx = 0; tIdx < aRectangles.length; tIdx++)
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
      return ((this.x2 - this.x) + 1) * ((this.y2 - this.y) + 1);
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

   this.ensureValid = function()
   {
      if (this.x < 0 || this.y < 0 || this.x2 < 0 || this.y2 < 0)
      {
         tMessage = 'Invalid rectangle' + this.toString();
         // FIXME uncomment
         //j = 1 + kUndefined;
         //throw tMessage;
      }
   };

   this.ensureValid();
}


/**
 * Quadrant class.
 */
function Quadrant(aAnchorPoint, aOtherVertexPoint)
{
   this.anchorPoint      = aAnchorPoint;
   this.otherVertexPoint = aOtherVertexPoint;
}


function rectangleFromAnchorPointToOtherPoint(aAnchorPointX, aAnchorPointY, aOtherPointX, aOtherPointY)
{
   // Create a rectangle with the given two points so that the first point is the top-left corner.

   if (aAnchorPointX < aOtherPointX)
   {
      if (aAnchorPointY < aOtherPointY)
      {
         return new Rectangle(aAnchorPointX, aAnchorPointY, aOtherPointX, aOtherPointY);
      }
      else
      {
         return new Rectangle(aAnchorPointX, aOtherPointY, aOtherPointX, aAnchorPointY);
      }
   }
   else
   {
      if (aAnchorPointY < aOtherPointY)
      {
         return new Rectangle(aOtherPointX, aAnchorPointY, aAnchorPointX, aOtherPointY);
      }
      else
      {
         return new Rectangle(aOtherPointX, aOtherPointY, aAnchorPointX, aAnchorPointY);
      }
   }

   // FIXME maybe some weird circumstances to watch out for
}

//==============================================================================

main()
