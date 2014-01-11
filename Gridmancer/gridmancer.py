#!/usr/bin/env python

#
# http://codecombat.com/play/level/gridmancer#
#

# grid starts at lower left 0-based index (increase as go up/right)
# grid represents where walls are
# 0 = no wall
# 1 = wall

# # complex solution
# * do the cross
# * consider each rectangle, regardless of whether already taken
# * find each rectangle this new one overlaps.
# * find the new way to break this up
# * if the resulting number of rectangles is smaller, choose this new solution


# * should work for the example level but may fail if the level is not aligned to a 4x4 grid style.
# * assumption: bounded by a wall on all sides, otherwise out-of-bounds errors will occur
# * all of my functions are based with the grid (0, 0) based in the upper-left and increasing right/down.

# * there is a problem with the was I represented the problem. It has to do with
#   representation of coordinates. I really want to represent each coordinate as
#   the center of a square. That is opposed to the other representation where a
#   coordinate has no width, height. Thus, in both systems the equivalent unit
#   square is:
#   - [(1, 1), (1, 1)] equal to (1, 1)
#   - [(1, 1), (2, 2)]

# ==============================================================================

# Fill the empty space with the minimum number of rectangles.
# (Rectangles should not overlap each other or walls.)
# The grid size is 1 meter, but the smallest wall/floor tile is 4 meters.
# If you can do better than one rectangle for every tile, let us know!
# We'll help you find a programming job (if you want one).
# Check the blue guide button at the top for more info.
# Press Contact below to report success if you want a job!
# Just include your multiplayer link in the contact email.
# Make sure to sign up on the home page to save your code.
# 

# ==============================================================================

# Test data
kIsTest = True

#
# Flip the grid vertically.
#
def transformedGrid(aGrid):
   '''
   Flip the grid vertically.
   '''
   return reversed(aGrid)


def getGrid():
   if kIsTest:
      tTest1 = \
         [
            [[1], [1], [1], [1], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1], [1], [1], [1], [1]],
         ]
      tTest2 = \
         [
            [[1], [1], [1], [1], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1], [1],  [], [1], [1]],
            [[1], [1],  [], [1], [1]],
            [[1], [1], [1], [1], [1]],
         ]
      tTest3 = \
         [
            [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
            [[1],  [],  [],  [], [1], [1], [1], [1],  [], [1]],
            [[1],  [],  [],  [], [1],  [], [1],  [],  [], [1]],
            [[1],  [],  [],  [], [1], [1], [1],  [],  [], [1]],
            [[1], [1],  [], [1], [1], [1], [1], [1],  [], [1]],
            [[1], [1],  [], [1],  [],  [],  [], [1], [1], [1]],
            [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
         ]
      tTest4 = \
         [
            [[1], [1], [1], [1], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
            [[1],  [],  [],  [], [1]],
         ]

      return tTest4
   else:
      # Flip the grid because my code uses a different coordinate system.
      #return this.transformedGrid(this.getNavGrid().grid);
      pass


def writeDebug(aString):
   if kIsTest:
      print aString
   else:
      # Do nothing.
      pass

#==============================================================================

kGrid       = getGrid()
kRectangles = []
kTileSize   = 1
kIncrement  = 0

writeDebug(len(kGrid))
writeDebug(len(kGrid[0]))

def main():
   for (tY = 0; tY + kIncrement < len(kGrid); tY += kTileSize):
      for (tX = 0; tX + kIncrement < len(kGrid[0]); tX += kTileSize):
         writeDebug('')
         writeDebug('Checking point = ' + Point(tX, tY))
         tNotOccupied = isNotWallAndNotTakenByRectangle(kGrid, kRectangles, tX, tY)
         
         if tNotOccupied:
            tAnchorPoint = Point(tX, tY)
            writeDebug('Point is not occupied: ' + tAnchorPoint)

            tLargestRectangle = findLargestRectangleFromAnchorPointAvoidTaken(kGrid, kRectangles, tAnchorPoint)

            if tLargestRectangle:
               writeDebug('The largest rectangle was = ' + tLargestRectangle)
               myAddRectangle(kRectangles, tLargestRectangle)

   # At this point the entire grid should be filled with rectangles.

   writeDebug('===================================')
   writeDebug('There are ' + len(kRectangles) + ' rectangles = ' + kRectangles)

#==============================================================================

def myAddRectangle(aRectangles, aRectangle):
   writeDebug('Adding rectangle = ' + aRectangle)
   if not kIsTest:
      addRect(aRectangle.x + (aRectangle.width / 2),
              aRectangle.y + (aRectangle.height / 2),
              aRectangle.width,
              aRectangle.height)
   aRectangles.append(aRectangle)


#
# * avoids giving a rectangle containing taken squares
# * throws exception if anchor point is taken
#
def findLargestRectangleFromAnchorPointAvoidTaken(aGrid, aRectangles, aAnchorPoint):
{
   tCardinalCollisionsArray = findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint)
   tNorth = tCardinalCollisionsArray[0]
   tSouth = tCardinalCollisionsArray[1]
   tWest  = tCardinalCollisionsArray[2]
   tEast  = tCardinalCollisionsArray[3]
   writeDebug('Collision array: ' + '[north = ' + tNorth.y + '], ' + '[south = ' + tSouth.y + '], ' + '[west = ' + tWest.x + '], ' + '[east = ' + tEast.x + ']')

   tQuadrant1 = Quadrant(aAnchorPoint, Point(tEast.x, tNorth.y))
   tQuadrant2 = Quadrant(aAnchorPoint, Point(tEast.x, tSouth.y))
   tQuadrant3 = Quadrant(aAnchorPoint, Point(tWest.x, tSouth.y))
   tQuadrant4 = Quadrant(aAnchorPoint, Point(tWest.x, tNorth.y))
   
   writeDebug('searching quadrant 1')
   tQuadrant1Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant1.otherVertexPoint,  1, -1, max, 'max')
   writeDebug('searching quadrant 2')
   tQuadrant2Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant2.otherVertexPoint,  1,  1, min, 'min')
   writeDebug('searching quadrant 3')
   tQuadrant3Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant3.otherVertexPoint, -1,  1, min, 'min')
   writeDebug('searching quadrant 4')
   tQuadrant4Rects = findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, tQuadrant4.otherVertexPoint, -1, -1, max, 'max')
   
   tRect1And2 = largestCombinedRectangleQuadrant1And2(tQuadrant1Rects, tQuadrant2Rects)
   writeDebug('largest combined 1+2 = ' + tRect1And2)
   tRect2And3 = largestCombinedRectangleQuadrant2And3(tQuadrant2Rects, tQuadrant3Rects)
   writeDebug('largest combined 2+3 = ' + tRect2And3)
   tRect3And4 = largestCombinedRectangleQuadrant3And4(tQuadrant3Rects, tQuadrant4Rects)
   writeDebug('largest combined 3+4 = ' + tRect3And4)
   tRect4And1 = largestCombinedRectangleQuadrant1And4(tQuadrant1Rects, tQuadrant4Rects)
   writeDebug('largest combined 4+1 = ' + tRect4And1)
   
   tCombinedRectsArray = [tRect1And2, tRect2And3, tRect3And4, tRect4And1]
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant1Rects)
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant2Rects)
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant3Rects)
   tCombinedRectsArray = tCombinedRectsArray.concat(tQuadrant4Rects)
   tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray)
   
   return tMaxAreaRectangle
}


def maxAreaRectangle(aRectanglesArray):
   tMaxAreaRectangle = None;
   tMaxArea = -1;
   
   for (tIdx = 0; tIdx < len(aRectanglesArray); tIdx++):
      if (aRectanglesArray[tIdx].area() > tMaxArea):
         tMaxAreaRectangle = aRectanglesArray[tIdx]
         tMaxArea = tMaxAreaRectangle.area()
   
   return tMaxAreaRectangle


def largestCombinedRectangleQuadrant1And2(aRectanglesQuadrant1, aRectanglesQuadrant2):
   '''
   relies on the fact that the anchor point is shared to work correctly
   '''
   tPotentialRectangles = []

   # Try all combinations of rectangles from each quadrant whose x values align,
   # then choose the largest one.
   for (tI = 0; tI < len(aRectanglesQuadrant1); tI++):
      tFirst = aRectanglesQuadrant1[tI]
      for (tJ = 0; tJ < len(aRectanglesQuadrant2); tJ++):
         tSecond = aRectanglesQuadrant2[tJ]
         if tFirst.x2 == tSecond.x2:
            # top-left to bottom-right
            tTestRectangle = Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.append(tTestRectangle)
   
   return maxAreaRectangle(tPotentialRectangles)


def largestCombinedRectangleQuadrant2And3(aRectanglesQuadrant2, aRectanglesQuadrant3):
   tPotentialRectangles = new Array();

   # Try all combinations of rectangles from each quadrant whose y values align,
   # then choose the largest one.
   for (tI = 0; tI < len(aRectanglesQuadrant3); tI++):
      tFirst = aRectanglesQuadrant3[tI]
      for (var tJ = 0; tJ < aRectanglesQuadrant2.length; tJ++):
         tSecond = aRectanglesQuadrant2[tJ]
         if tFirst.y2 == tSecond.y2:
            # top-left to bottom-right
            var tTestRectangle = new Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.push(tTestRectangle)
   
   return maxAreaRectangle(tPotentialRectangles)


def largestCombinedRectangleQuadrant3And4(aRectanglesQuadrant3, aRectanglesQuadrant4):
   tPotentialRectangles = []

   # Try all combinations of rectangles from each quadrant whose x values align,
   # then choose the largest one.
   for (tI = 0; tI < aRectanglesQuadrant4.length; tI++):
      tFirst = aRectanglesQuadrant4[tI]
      for (tJ = 0; tJ < aRectanglesQuadrant3.length; tJ++):
         tSecond = aRectanglesQuadrant3[tJ]
         if tFirst.x2 == tSecond.x2:
            # top-left to bottom-right
            tTestRectangle = Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.append(tTestRectangle)
   
   return maxAreaRectangle(tPotentialRectangles)


def largestCombinedRectangleQuadrant1And4(aRectanglesQuadrant1, aRectanglesQuadrant4):
   tPotentialRectangles = []

   # Try all combinations of rectangles from each quadrant whose y values align,
   # then choose the largest one.
   for (tI = 0; tI < aRectanglesQuadrant4.length; tI++):
      tFirst = aRectanglesQuadrant4[tI]
      for (tJ = 0; tJ < aRectanglesQuadrant1.length; tJ++):
         tSecond = aRectanglesQuadrant1[tJ]
         if tFirst.y2 == tSecond.y2:
            # top-left to bottom-right
            tTestRectangle = Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.append(tTestRectangle)

   return maxAreaRectangle(tPotentialRectangles)


def findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint):
   tNorth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0, -1)
   tSouth = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  0,  1)
   tWest  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, -1,  0)
   tEast  = findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint,  1,  0)
   
   tArray = []
   tArray.push(tNorth)
   tArray.push(tSouth)
   tArray.push(tWest)
   tArray.push(tEast)
   
   return tArray


def findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, aHorizontalIncrement, aVerticalIncrement):
   tX = None
   tY = None
   for (tX = aAnchorPoint.x, tY = aAnchorPoint.y;
        !this.isWall(aGrid, tX, tY) && this.isNotTakenByRectangle(aRectangles, tX, tY);
        tX += aHorizontalIncrement, tY += aVerticalIncrement)
      # Do nothing.
      pass
   
   return Point(tX, tY)


def findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, aOtherVertexPoint, aSweepHorizontal, aSweepVertical, aVerticalMinOrMaxFunction, aVerticalMinOrMaxString):
   '''
   Not optimized for speed; optimized for largest rectangle
   '''

   if (this.isWall(aGrid, aAnchorPoint.x, aAnchorPoint.y) || !this.isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y)):
      raise Exception("Anchor point must not be a wall.")

   writeDebug('Finding all rectangles in quadrant between two points. [anchor = ' + aAnchorPoint + '], [other = ' + aOtherVertexPoint + ']')

   tVerticalMinOrMaxSoFar = aOtherVertexPoint.y
   tRectangles = []
   writeDebug('vertical min/max started out as = ' + tVerticalMinOrMaxSoFar)
   
   for (var tX = aAnchorPoint.x; tX != (aOtherVertexPoint.x /*+ aSweepHorizontal*/); tX += aSweepHorizontal):
      for (var tY = aAnchorPoint.y; tY != (aOtherVertexPoint.y /*+ aSweepVertical*/); tY += aSweepVertical):
         if (this.isWall(aGrid, tX, tY) || !this.isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y)):
            #writeDebug('original min/max = ' + tVerticalMinOrMaxSoFar);
            #writeDebug('tY original = ' + tY);
            tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY - aSweepVertical) # looking back on the previous square. could be problamatic
            break

      writeDebug('the vertical min/max is now = ' + tVerticalMinOrMaxSoFar)
      tRectangle = rectangleFromAnchorPointToOtherPoint(aAnchorPoint.x, aAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - aSweepVertical)
      writeDebug('adding rectangle to quadrant = ' + tRectangle)
      tRectangles.append(tRectangle)
   
   return tRectangles


def isWall(aGrid, aX, aY):
   '''
   Returns true if is a wall or not a valid position on the grid (out-of-bounds).
   '''
   if (0 > aX || aX >= aGrid[0].length ||
       0 > aY || aY >= aGrid.length):
      return True

   return (len(aGrid[aY][aX]) == 1)


def isNotTakenByRectangle(aRectangles, aX, aY):
   for (tIdx = 0; tIdx < aRectangles.length; tIdx++):
      if (aRectangles[tIdx].contains(aX, aY)):
         return False
      
   return True


def isNotWallAndNotTakenByRectangle(aGrid, aRectangles, aX, aY):
   return (!this.isWall(aGrid, aX, aY) && this.isNotTakenByRectangle(aRectangles, aX, aY))

#==============================================================================

class Point(object):
   def __init__(self, aX, aY):
      self.x = aX;
      self.y = aY;
   
   def toString(self):
      return '(' + self.x + ', ' + self.y + ')'


class Rectangle(object):
   def __init__(self, aX, aY, aX2, aY2):
      self.x = aX1
      self.y = aY1
      
      self.x2 = aX2
      self.y2 = aY2
      
      self.width = self.x2 - self.x
      self.height = self.y2 - self.y


      self.ensureValid()
   
   def area(self):
      return ((self.x2 - self.x) + 1) * ((self.y2 - self.y) + 1)
   
   def contains(self, aX, aY):
      return (self.x <= aX && aX <= self.x2 &&
              self.y <= aY && aY <= self.y2)

   def containsPoint(aPoint):
      return self.contains(aPoint.x, aPoint.y)
   
   def toString(self):
      return '[(' + self.x + ', ' + self.y + '), ' + '(' + self.x2 + ', ' + self.y2 + ')]'

   def ensureValid(self):
      if (self.x < 0 || self.y < 0 || self.x2 < 0 || self.y2 < 0):
         tMessage = 'Invalid rectangle' + self.toString()
         # FIXME uncomment
         #j = 1 + kUndefined;
         #throw tMessage;


class Quadrant(object):
   def __init__(self, aAnchorPoint, aOtherVertexPoint):
      self.anchorPoint      = aAnchorPoint
      self.otherVertexPoint = aOtherVertexPoint


def rectangleFromAnchorPointToOtherPoint(aAnchorPointX, aAnchorPointY, aOtherPointX, aOtherPointY):
   # Create a rectangle with the given two points so that the first point is the top-left corner.

   if (aAnchorPointX < aOtherPointX):
      if (aAnchorPointY < aOtherPointY):
         return new Rectangle(aAnchorPointX, aAnchorPointY, aOtherPointX, aOtherPointY)
      else:
      
         return new Rectangle(aAnchorPointX, aOtherPointY, aOtherPointX, aAnchorPointY)
   else:
      if (aAnchorPointY < aOtherPointY):
         return new Rectangle(aOtherPointX, aAnchorPointY, aAnchorPointX, aOtherPointY)
      else:
         return new Rectangle(aOtherPointX, aOtherPointY, aAnchorPointX, aAnchorPointY)

   # FIXME maybe some weird circumstances to watch out for

#==============================================================================

if __name__ == '__main__':
   main()
