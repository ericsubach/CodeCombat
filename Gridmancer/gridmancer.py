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

      return tTest3
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
   tY = 0
   while (tY + kIncrement < len(kGrid)):
      tX = 0
      while (tX + kIncrement < len(kGrid[0])):
         writeDebug('')
         writeDebug('Checking point = ' + str(Point(tX, tY)))
         tNotOccupied = isNotWallAndNotTakenByRectangle(kGrid, kRectangles, tX, tY)
         
         if tNotOccupied:
            tAnchorPoint = Point(tX, tY)
            writeDebug('Point is not occupied: ' + str(tAnchorPoint))

            tLargestRectangle = findLargestRectangleFromAnchorPointAvoidTaken(kGrid, kRectangles, tAnchorPoint)

            if tLargestRectangle:
               writeDebug('The largest rectangle was = ' + str(tLargestRectangle))
               myAddRectangle(kRectangles, tLargestRectangle)
         tX += kTileSize
      tY += kTileSize

   # At this point the entire grid should be filled with rectangles.

   writeDebug('===================================')
   writeDebug('There are ' + str(len(kRectangles)) + ' rectangles = ' + str(kRectangles))

   drawSolution(kGrid, kRectangles)

#==============================================================================

def myAddRectangle(aRectangles, aRectangle):
   writeDebug('Adding rectangle = ' + str(aRectangle))
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
   tCardinalCollisionsArray = findNearestCollisionPointsInAllDirections(aGrid, aRectangles, aAnchorPoint)
   tNorth = tCardinalCollisionsArray[0]
   tSouth = tCardinalCollisionsArray[1]
   tWest  = tCardinalCollisionsArray[2]
   tEast  = tCardinalCollisionsArray[3]
   writeDebug('Collision array: ' + '[north = ' + str(tNorth.y) + '], ' + '[south = ' + str(tSouth.y) + '], ' + '[west = ' + str(tWest.x) + '], ' + '[east = ' + str(tEast.x) + ']')

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
   writeDebug('largest combined 1+2 = ' + str(tRect1And2))
   tRect2And3 = largestCombinedRectangleQuadrant2And3(tQuadrant2Rects, tQuadrant3Rects)
   writeDebug('largest combined 2+3 = ' + str(tRect2And3))
   tRect3And4 = largestCombinedRectangleQuadrant3And4(tQuadrant3Rects, tQuadrant4Rects)
   writeDebug('largest combined 3+4 = ' + str(tRect3And4))
   tRect4And1 = largestCombinedRectangleQuadrant1And4(tQuadrant1Rects, tQuadrant4Rects)
   writeDebug('largest combined 4+1 = ' + str(tRect4And1))
   
   tCombinedRectsArray = [tRect1And2, tRect2And3, tRect3And4, tRect4And1]
   tCombinedRectsArray.extend(tQuadrant1Rects)
   tCombinedRectsArray.extend(tQuadrant2Rects)
   tCombinedRectsArray.extend(tQuadrant3Rects)
   tCombinedRectsArray.extend(tQuadrant4Rects)
   tMaxAreaRectangle = maxAreaRectangle(tCombinedRectsArray)
   
   return tMaxAreaRectangle


def maxAreaRectangle(aRectanglesArray):
   tMaxAreaRectangle = None;
   tMaxArea = -1;
   
   for tIdx in xrange(0, len(aRectanglesArray)):
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
   for tI in xrange(0, len(aRectanglesQuadrant1)):
      tFirst = aRectanglesQuadrant1[tI]
      for tJ in xrange(0, len(aRectanglesQuadrant2)):
         tSecond = aRectanglesQuadrant2[tJ]
         if tFirst.x2 == tSecond.x2:
            # top-left to bottom-right
            tTestRectangle = Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.append(tTestRectangle)
   
   return maxAreaRectangle(tPotentialRectangles)


def largestCombinedRectangleQuadrant2And3(aRectanglesQuadrant2, aRectanglesQuadrant3):
   tPotentialRectangles = []

   # Try all combinations of rectangles from each quadrant whose y values align,
   # then choose the largest one.
   for tI in xrange(0, len(aRectanglesQuadrant3)):
      tFirst = aRectanglesQuadrant3[tI]
      for tJ in xrange(0, len(aRectanglesQuadrant2)):
         tSecond = aRectanglesQuadrant2[tJ]
         if tFirst.y2 == tSecond.y2:
            # top-left to bottom-right
            tTestRectangle = Rectangle(tFirst.x, tFirst.y, tSecond.x2, tSecond.y2)
            tPotentialRectangles.append(tTestRectangle)
   
   return maxAreaRectangle(tPotentialRectangles)


def largestCombinedRectangleQuadrant3And4(aRectanglesQuadrant3, aRectanglesQuadrant4):
   tPotentialRectangles = []

   # Try all combinations of rectangles from each quadrant whose x values align,
   # then choose the largest one.
   for tI in xrange(0, len(aRectanglesQuadrant4)):
      tFirst = aRectanglesQuadrant4[tI]
      for tJ in xrange(0, len(aRectanglesQuadrant3)):
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
   for tI in xrange(0, len(aRectanglesQuadrant4)):
      tFirst = aRectanglesQuadrant4[tI]
      for tJ in xrange(0, len(aRectanglesQuadrant1)):
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
   tArray.append(tNorth)
   tArray.append(tSouth)
   tArray.append(tWest)
   tArray.append(tEast)
   
   return tArray


def findNearestCollisionPointInDirection(aGrid, aRectangles, aAnchorPoint, aHorizontalIncrement, aVerticalIncrement):
   tX = aAnchorPoint.x
   tY = aAnchorPoint.y
   while (not isWall(aGrid, tX, tY) and isNotTakenByRectangle(aRectangles, tX, tY)):
      tX += aHorizontalIncrement
      tY += aVerticalIncrement
      # Do nothing.
   
   return Point(tX, tY)


def findAllRectsInQuadrantAvoidTaken(aGrid, aRectangles, aAnchorPoint, aOtherVertexPoint, aSweepHorizontal, aSweepVertical, aVerticalMinOrMaxFunction, aVerticalMinOrMaxString):
   '''
   Not optimized for speed; optimized for largest rectangle
   '''

   if (isWall(aGrid, aAnchorPoint.x, aAnchorPoint.y) or not isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y)):
      raise Exception("Anchor point must not be a wall.")

   writeDebug('Finding all rectangles in quadrant between two points. [anchor = ' + str(aAnchorPoint) + '], [other = ' + str(aOtherVertexPoint) + ']')

   tVerticalMinOrMaxSoFar = aOtherVertexPoint.y
   tRectangles = []
   writeDebug('vertical min/max started out as = ' + str(tVerticalMinOrMaxSoFar))
   
   tX = aAnchorPoint.x
   while tX != aOtherVertexPoint.x:
      tY = aAnchorPoint.y
      while tY != aOtherVertexPoint.y:
         if (isWall(aGrid, tX, tY) or not isNotTakenByRectangle(aRectangles, aAnchorPoint.x, aAnchorPoint.y)):
            #writeDebug('original min/max = ' + tVerticalMinOrMaxSoFar);
            #writeDebug('tY original = ' + tY);
            tVerticalMinOrMaxSoFar = aVerticalMinOrMaxFunction(tVerticalMinOrMaxSoFar, tY - aSweepVertical) # looking back on the previous square. could be problamatic
            break
         tY += aSweepVertical

      writeDebug('the vertical min/max is now = ' + str(tVerticalMinOrMaxSoFar))
      tRectangle = rectangleFromAnchorPointToOtherPoint(aAnchorPoint.x, aAnchorPoint.y, tX, tVerticalMinOrMaxSoFar - aSweepVertical)
      writeDebug('adding rectangle to quadrant = ' + str(tRectangle))
      tRectangles.append(tRectangle)
   
      tX += aSweepHorizontal
   return tRectangles


def isWall(aGrid, aX, aY):
   '''
   Returns true if is a wall or not a valid position on the grid (out-of-bounds).
   '''
   if (0 > aX or aX >= len(aGrid[0]) or
       0 > aY or aY >= len(aGrid)):
      return True

   return (len(aGrid[aY][aX]) == 1)


def isNotTakenByRectangle(aRectangles, aX, aY):
   for tIdx in xrange(0, len(aRectangles)):
      if (aRectangles[tIdx].contains(aX, aY)):
         return False
      
   return True


def isNotWallAndNotTakenByRectangle(aGrid, aRectangles, aX, aY):
   return (not isWall(aGrid, aX, aY) and isNotTakenByRectangle(aRectangles, aX, aY))

#==============================================================================

class Point(object):
   def __init__(self, aX, aY):
      self.x = aX;
      self.y = aY;
   
   def toString(self):
      return '(' + str(self.x) + ', ' + str(self.y) + ')'

   def __str__(self):
      return self.toString()

   def __repr__(self):
      return self.toString()


class Rectangle(object):
   def __init__(self, aX1, aY1, aX2, aY2):
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
      return (self.x <= aX and aX <= self.x2 and
              self.y <= aY and aY <= self.y2)

   def containsPoint(aPoint):
      return self.contains(aPoint.x, aPoint.y)
   
   def toString(self):
      return '[(' + str(self.x) + ', ' + str(self.y) + '), ' + '(' + str(self.x2) + ', ' + str(self.y2) + ')]'

   def __str__(self):
      return self.toString()

   def __repr__(self):
      return self.toString()

   def ensureValid(self):
      if (self.x < 0 or self.y < 0 or self.x2 < 0 or self.y2 < 0):
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
         return Rectangle(aAnchorPointX, aAnchorPointY, aOtherPointX, aOtherPointY)
      else:
      
         return Rectangle(aAnchorPointX, aOtherPointY, aOtherPointX, aAnchorPointY)
   else:
      if (aAnchorPointY < aOtherPointY):
         return Rectangle(aOtherPointX, aAnchorPointY, aAnchorPointX, aOtherPointY)
      else:
         return Rectangle(aOtherPointX, aOtherPointY, aAnchorPointX, aAnchorPointY)

   # FIXME maybe some weird circumstances to watch out for

#==============================================================================

def drawSolution(aGrid, aRectangles):
   from Tkinter import *

   tTileWidthPx = 30



   tMaster = Tk()
   w = Canvas(tMaster, width=600, height=600)
   w.pack()

   # The location that a square is drawn in assumed to be from the top-left to bottom-right.

   for tY in xrange(len(aGrid)):
      for tX in xrange(len(aGrid[0])):
         tXPos = tX*tTileWidthPx
         tYPos = tY*tTileWidthPx
         if isWall(aGrid, tX, tY):
            tColor = 'gray'
         else:
            tColor = 'blue'
         w.create_rectangle(tXPos, tYPos, tXPos+tTileWidthPx, tYPos+tTileWidthPx, fill=tColor, outline='black')

   for tRectangle in aRectangles:
      tXPos = tRectangle.x*tTileWidthPx
      tYPos = tRectangle.y*tTileWidthPx
      tX2Pos = tRectangle.x2*tTileWidthPx + tTileWidthPx
      tY2Pos = tRectangle.y2*tTileWidthPx + tTileWidthPx
      w.create_rectangle(tXPos, tYPos, tX2Pos, tY2Pos, fill='red', outline='black')

   mainloop()
#==============================================================================

if __name__ == '__main__':
   main()
