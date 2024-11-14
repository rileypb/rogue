
class Visibility {
	compute(origin, rangeLimit) {
		// do nothing
	}
}

class SlopeOld {
	constructor(y, x) {
		this.x = x;
		this.y = y;
	}

	greater(y, x) {
		return this.y * x > this.x * y;
	}

	greaterOrEqual(y, x) {
		return this.y * x >= this.x * y;
	}

	less(y, x) {
		return this.y * x < this.x * y;
	}

	lessOrEqual(y, x) {
		return this.y * x <= this.x * y;
	}

}

class LevelPoint {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function createAdamMilVisibility(floorPlan, player) {
	return new AdamMilVisibility(
		(x, y) => {
			if (floorPlan.get(x, y)) {
				return !floorPlan.get(x, y).isTransparent();
			}
			return true;
		},
		(x, y) => {
			if (floorPlan.get(x, y)) {
				floorPlan.get(x, y).hasLineOfSight = true;
			}
		},
		(x, y) => Math.sqrt(x ** 2 + y ** 2)
	);
}

function createDiamondWallsVisibility(floorPlan, player) {
	return new DiamondWallsVisibility(
		(x, y) => {
			if (floorPlan.get(x, y)) {
				return !floorPlan.get(x, y).isTransparent();
			}
			return true;
		},
		(x, y) => {
			if (floorPlan.get(x, y)) {
				floorPlan.get(x, y).hasLineOfSight = true;
			}
		},
		(x, y) => x+y	
	);
}

class AdamMilVisibilityOld extends Visibility {
	constructor(fnBlocksLight, fnSetVisible, fnGetDistance) {
		super();
		this.fnBlocksLight = fnBlocksLight;
		this.fnSetVisible = fnSetVisible;
		this.fnGetDistance = fnGetDistance;
	}

	compute(origin, rangeLimit) {
		this.fnSetVisible(origin.x, origin.y);
		for (let octant = 0; octant < 8; octant++) {
			this.computeOctant(octant, origin, rangeLimit, 1, new Slope(1, 1), new Slope(0, 1));
		}
	}

	computeOctant(octant, origin, rangeLimit, x, top, bottom) {
		for (; x <= int(rangeLimit); x++) {
			let topY = 0;
			if (top.x == 1) {
				topY = x;
			} else {
				topY = ((x * 2 - 1) * top.y + top.x) / (top.x * 2);
				if (this.blocksLight(x, topY, octant, origin)) {
					if (top.greaterOrEqual(topY * 2 + 1, x * 2) && !this.blocksLight(x, topY + 1, octant, origin)) {
						topY++;
					}
				} else {
					let ax = x * 2;
					if (this.blocksLight(x + 1, topY + 1, octant, origin)) {
						ax++;
					}
					if (top.greater(topY * 2 + 1, ax)) {
						topY++;
					}
				}
			}

			let bottomY = 0;
			if (bottom.y == 0) {
				bottomY = 0;
			} else {
				bottomY = ((x * 2 - 1) * bottom.y + bottom.x) / (bottom.x * 2);
				if (bottom.greaterOrEqual(bottomY * 2 + 1, x * 2) && this.blocksLight(x, bottomY, octant, origin) && !this.blocksLight(x, bottomY + 1, octant, origin)) {
					bottomY++;
				}
			}

			let wasOpaque = -1;
			for (let y = topY; int(y) >= int(bottomY); y--) {
				if (rangeLimit < 0 || this.fnGetDistance(int(x), int(y)) <= rangeLimit) {
					let isOpaque = this.blocksLight(x, y, octant, origin);
					let isVisible = isOpaque || ((y != topY || top.greater(y * 4 - 1, x * 4 + 1)) && (y != bottomY || bottom.less(y * 4 + 1, x * 4 - 1)));
					// let isVisible = ((y != topY || top.greaterOrEqual(y, x)) && (y != bottomY || bottom.lessOrEqual(y, x)));
					if (isVisible) {
						this.setVisible(x, y, octant, origin);
					}

					if (x != rangeLimit) {
						if (isOpaque) {
							if (wasOpaque == 0) {
								let nx = x * 2;
								let ny = y * 2 + 1;
								if (this.blocksLight(x, y + 1, octant, origin)) {
									nx--;
								}
								if (top.greater(ny, nx)) {
									if (y == bottomY) {
										bottom = new Slope(ny, nx);
										break;
									} else {
										this.computeOctant(octant, origin, rangeLimit, x + 1, top, new Slope(ny, nx));
									}
								} else {
									if (y == bottomY) {
										return;
									}
								}
							}
							wasOpaque = 1;
						} else {
							if (wasOpaque > 0) {
								let nx = x * 2;
								let ny = y * 2 + 1;
								if (this.blocksLight(x + 1, y + 1, octant, origin)) {
									nx++;
								}
								if (bottom.greaterOrEqual(ny, nx)) {
									return;
								}
								top = new Slope(ny, nx);
							}
							wasOpaque = 0;
						}
					}
				}
			}

			if (wasOpaque != 0) {
				break;
			}
		}
	}

	blocksLight(x, y, octant, origin) {
		let nx = origin.x;
		let ny = origin.y;

		switch (octant) {
			case 0:
				nx += x;
				ny -= y;
				break;
			case 1:
				nx += y;
				ny -= x;
				break;
			case 2:
				nx -= y;
				ny -= x;
				break;
			case 3:
				nx -= x;
				ny -= y;
				break;
			case 4:
				nx -= x;
				ny += y;
				break;
			case 5:
				nx -= y;
				ny += x;
				break;
			case 6:
				nx += y;
				ny += x;
				break;
			case 7:
				nx += x;
				ny += y;
				break;
		}
		return this.fnBlocksLight(nx, ny);
	}

	setVisible(x, y, octant, origin) {
		let nx = origin.x;
		let ny = origin.y;

		switch (octant) {
			case 0:
				nx += x;
				ny -= y;
				break;
			case 1:
				nx += y;
				ny -= x;
				break;
			case 2:
				nx -= y;
				ny -= x;
				break;
			case 3:
				nx -= x;
				ny -= y;
				break;
			case 4:
				nx -= x;
				ny += y;
				break;
			case 5:
				nx -= y;
				ny += x;
				break;
			case 6:
				nx += y;
				ny += x;
				break;
			case 7:
				nx += x;
				ny += y;
				break;
		}
		this.fnSetVisible(nx, ny);
	}

}

class Slope // represents the slope Y/X as a rational number
{
	constructor(y, x) {
		this.y = y;
		this.x = x;
	}

	greater(y, x) { return this.y * x > this.x * y; } // this > y/x
	greaterOrEqual(y, x) { return this.y * x >= this.x * y; } // this >= y/x
	less(y, x) { return this.y * x < this.x * y; } // this < y/x
	lessOrEqual(y, x) { return this.y * x <= this.x * y; } // this <= y/x
}

class AdamMilVisibility extends Visibility {
	/// <param name="blocksLight">A function that accepts the X and Y coordinates of a tile and determines whether the
	/// given tile blocks the passage of light. The function must be able to accept coordinates that are out of bounds.
	/// </param>
	/// <param name="setVisible">A function that sets a tile to be visible, given its X and Y coordinates. The function
	/// must ignore coordinates that are out of bounds.
	/// </param>
	/// <param name="getDistance">A function that takes the X and Y coordinate of a point where X >= 0,
	/// Y >= 0, and X >= Y, and returns the distance from the point to the origin (0,0).
	/// </param>
	constructor(fnBlocksLight, fnSetVisible, fnGetDistance) {
		super();
		this.fnBlocksLight = fnBlocksLight;
		this.fnSetVisible = fnSetVisible;
		this.fnGetDistance = fnGetDistance;
	}

	compute(origin, rangeLimit) {
		this.fnSetVisible(origin.X, origin.Y);
		for (let octant = 0; octant < 8; octant++) {
			this.computeOctant(octant, origin, rangeLimit, 1, new Slope(1, 1), new Slope(0, 1));
		}
	}

	computeOctant(octant, origin, rangeLimit, x, top, bottom)
	{
		// throughout this function there are references to various parts of tiles. a tile's coordinates refer to its
		// center, and the following diagram shows the parts of the tile and the vectors from the origin that pass through
		// those parts. given a part of a tile with vector u, a vector v passes above it if v > u and below it if v < u
		//    g         center:        y / x
		// a------b   a top left:      (y*2+1) / (x*2-1)   i inner top left:      (y*4+1) / (x*4-1)
		// |  /\  |   b top right:     (y*2+1) / (x*2+1)   j inner top right:     (y*4+1) / (x*4+1)
		// |i/__\j|   c bottom left:   (y*2-1) / (x*2-1)   k inner bottom left:   (y*4-1) / (x*4-1)
		//e|/|  |\|f  d bottom right:  (y*2-1) / (x*2+1)   m inner bottom right:  (y*4-1) / (x*4+1)
		// |\|__|/|   e middle left:   (y*2) / (x*2-1)
		// |k\  /m|   f middle right:  (y*2) / (x*2+1)     a-d are the corners of the tile
		// |  \/  |   g top center:    (y*2+1) / (x*2)     e-h are the corners of the inner (wall) diamond
		// c------d   h bottom center: (y*2-1) / (x*2)     i-m are the corners of the inner square (1/2 tile width)
		//    h
		for (; x <= rangeLimit; x++) // (x <= (uint)rangeLimit) == (rangeLimit < 0 || x <= rangeLimit)
		{
			// compute the Y coordinates of the top and bottom of the sector. we maintain that top > bottom
			let topY;
			if (top.x == 1) // if top == ?/1 then it must be 1/1 because 0/1 < top <= 1/1. this is special-cased because top
			{              // starts at 1/1 and remains 1/1 as long as it doesn't hit anything, so it's a common case
				topY = x;
			}
			else // top < 1
			{
				// get the tile that the top vector enters from the left. since our coordinates refer to the center of the
				// tile, this is (x-0.5)*top+0.5, which can be computed as (x-0.5)*top+0.5 = (2(x+0.5)*top+1)/2 =
				// ((2x+1)*top+1)/2. since top == a/b, this is ((2x+1)*a+b)/2b. if it enters a tile at one of the left
				// corners, it will round up, so it'll enter from the bottom-left and never the top-left
				topY = ((x * 2 - 1) * top.y + top.x) / (top.x * 2); // the Y coordinate of the tile entered from the left
				// now it's possible that the vector passes from the left side of the tile up into the tile above before
				// exiting from the right side of this column. so we may need to increment topY
				if (this.blocksLight(x, topY, octant, origin)) // if the tile blocks light (i.e. is a wall)...
				{
					// if the tile entered from the left blocks light, whether it passes into the tile above depends on the shape
					// of the wall tile as well as the angle of the vector. if the tile has does not have a beveled top-left
					// corner, then it is blocked. the corner is beveled if the tiles above and to the left are not walls. we can
					// ignore the tile to the left because if it was a wall tile, the top vector must have entered this tile from
					// the bottom-left corner, in which case it can't possibly enter the tile above.
					//
					// otherwise, with a beveled top-left corner, the slope of the vector must be greater than or equal to the
					// slope of the vector to the top center of the tile (x*2, topY*2+1) in order for it to miss the wall and
					// pass into the tile above
					if (top.greaterOrEqual(topY * 2 + 1, x * 2) && !this.blocksLight(x, topY + 1, octant, origin)) topY++;
				}
				else // the tile doesn't block light
				{
					// since this tile doesn't block light, there's nothing to stop it from passing into the tile above, and it
					// does so if the vector is greater than the vector for the bottom-right corner of the tile above. however,
					// there is one additional consideration. later code in this method assumes that if a tile blocks light then
					// it must be visible, so if the tile above blocks light we have to make sure the light actually impacts the
					// wall shape. now there are three cases: 1) the tile above is clear, in which case the vector must be above
					// the bottom-right corner of the tile above, 2) the tile above blocks light and does not have a beveled
					// bottom-right corner, in which case the vector must be above the bottom-right corner, and 3) the tile above
					// blocks light and does have a beveled bottom-right corner, in which case the vector must be above the
					// bottom center of the tile above (i.e. the corner of the beveled edge).
					// 
					// now it's possible to merge 1 and 2 into a single check, and we get the following: if the tile above and to
					// the right is a wall, then the vector must be above the bottom-right corner. otherwise, the vector must be
					// above the bottom center. this works because if the tile above and to the right is a wall, then there are
					// two cases: 1) the tile above is also a wall, in which case we must check against the bottom-right corner,
					// or 2) the tile above is not a wall, in which case the vector passes into it if it's above the bottom-right
					// corner. so either way we use the bottom-right corner in that case. now, if the tile above and to the right
					// is not a wall, then we again have two cases: 1) the tile above is a wall with a beveled edge, in which
					// case we must check against the bottom center, or 2) the tile above is not a wall, in which case it will
					// only be visible if light passes through the inner square, and the inner square is guaranteed to be no
					// larger than a wall diamond, so if it wouldn't pass through a wall diamond then it can't be visible, so
					// there's no point in incrementing topY even if light passes through the corner of the tile above. so we
					// might as well use the bottom center for both cases.
					let ax = x * 2; // center
					if (this.BlocksLight(x + 1, topY + 1, octant, origin)) ax++; // use bottom-right if the tile above and right is a wall
					if (top.greater(topY * 2 + 1, ax)) topY++;
				}
			}

			let bottomY;
			if (bottom.y == 0) // if bottom == 0/?, then it's hitting the tile at Y=0 dead center. this is special-cased because
			{                 // bottom.Y starts at zero and remains zero as long as it doesn't hit anything, so it's common
				bottomY = 0;
			}
			else // bottom > 0
			{
				bottomY = ((x * 2 - 1) * bottom.y + bottom.x) / (bottom.x * 2); // the tile that the bottom vector enters from the left
				// code below assumes that if a tile is a wall then it's visible, so if the tile contains a wall we have to
				// ensure that the bottom vector actually hits the wall shape. it misses the wall shape if the top-left corner
				// is beveled and bottom >= (bottomY*2+1)/(x*2). finally, the top-left corner is beveled if the tiles to the
				// left and above are clear. we can assume the tile to the left is clear because otherwise the bottom vector
				// would be greater, so we only have to check above
				if (bottom.greaterOrEqual(bottomY * 2 + 1, x * 2) && this.blocksLight(x, bottomY, octant, origin) &&
					!this.blocksLight(x, bottomY + 1, octant, origin)) {
					bottomY++;
				}
			}

			// go through the tiles in the column now that we know which ones could possibly be visible
			let wasOpaque = -1; // 0:false, 1:true, -1:not applicable
			for (let y = topY; y >= bottomY; y--) // use a signed comparison because y can wrap around when decremented
			{
				if (rangeLimit < 0 || this.fnGetDistance(x, y) <= rangeLimit) // skip the tile if it's out of visual range
				{
					let isOpaque = this.blocksLight(x, y, octant, origin);
					// every tile where topY > y > bottomY is guaranteed to be visible. also, the code that initializes topY and
					// bottomY guarantees that if the tile is opaque then it's visible. so we only have to do extra work for the
					// case where the tile is clear and y == topY or y == bottomY. if y == topY then we have to make sure that
					// the top vector is above the bottom-right corner of the inner square. if y == bottomY then we have to make
					// sure that the bottom vector is below the top-left corner of the inner square
					let isVisible =
						isOpaque || ((y != topY || top.greater(y * 4 - 1, x * 4 + 1)) && (y != bottomY || bottom.less(y * 4 + 1, x * 4 - 1)));
					// NOTE: if you want the algorithm to be either fully or mostly symmetrical, replace the line above with the
					// following line (and uncomment the Slope.LessOrEqual method). the line ensures that a clear tile is visible
					// only if there's an unobstructed line to its center. if you want it to be fully symmetrical, also remove
					// the "isOpaque ||" part and see NOTE comments further down
					// bool isVisible = isOpaque || ((y != topY || top.GreaterOrEqual(y, x)) && (y != bottomY || bottom.LessOrEqual(y, x)));
					if (isVisible) this.setVisible(x, y, octant, origin);

					// if we found a transition from clear to opaque or vice versa, adjust the top and bottom vectors
					if (x != rangeLimit) // but don't bother adjusting them if this is the last column anyway
					{
						if (isOpaque) {
							if (wasOpaque == 0) // if we found a transition from clear to opaque, this sector is done in this column,
							{                  // so adjust the bottom vector upward and continue processing it in the next column
								// if the opaque tile has a beveled top-left corner, move the bottom vector up to the top center.
								// otherwise, move it up to the top left. the corner is beveled if the tiles above and to the left are
								// clear. we can assume the tile to the left is clear because otherwise the vector would be higher, so
								// we only have to check the tile above
								let nx = x * 2, ny = y * 2 + 1; // top center by default
								// NOTE: if you're using full symmetry and want more expansive walls (recommended), comment out the next line
								if (this.blocksLight(x, y + 1, octant, origin)) nx--; // top left if the corner is not beveled
								if (top.greater(ny, nx)) // we have to maintain the invariant that top > bottom, so the new sector
								{                       // created by adjusting the bottom is only valid if that's the case
									// if we're at the bottom of the column, then just adjust the current sector rather than recursing
									// since there's no chance that this sector can be split in two by a later transition back to clear
									if (y == bottomY) { bottom = new Slope(ny, nx); break; } // don't recurse unless necessary
									else this.computeOctant(octant, origin, rangeLimit, x + 1, top, new Slope(ny, nx));
								}
								else // the new bottom is greater than or equal to the top, so the new sector is empty and we'll ignore
								{    // it. if we're at the bottom of the column, we'd normally adjust the current sector rather than
									if (y == bottomY) return; // recursing, so that invalidates the current sector and we're done
								}
							}
							wasOpaque = 1;
						}
						else {
							if (wasOpaque > 0) // if we found a transition from opaque to clear, adjust the top vector downwards
							{
								// if the opaque tile has a beveled bottom-right corner, move the top vector down to the bottom center.
								// otherwise, move it down to the bottom right. the corner is beveled if the tiles below and to the right
								// are clear. we know the tile below is clear because that's the current tile, so just check to the right
								let nx = x * 2, ny = y * 2 + 1; // the bottom of the opaque tile (oy*2-1) equals the top of this tile (y*2+1)
								// NOTE: if you're using full symmetry and want more expansive walls (recommended), comment out the next line
								if (this.blocksLight(x + 1, y + 1, octant, origin)) nx++; // check the right of the opaque tile (y+1), not this one
								// we have to maintain the invariant that top > bottom. if not, the sector is empty and we're done
								if (bottom.greaterOrEqual(ny, nx)) return;
								top = new Slope(ny, nx);
							}
							wasOpaque = 0;
						}
					}
				}
			}

			// if the column didn't end in a clear tile, then there's no reason to continue processing the current sector
			// because that means either 1) wasOpaque == -1, implying that the sector is empty or at its range limit, or 2)
			// wasOpaque == 1, implying that we found a transition from clear to opaque and we recursed and we never found
			// a transition back to clear, so there's nothing else for us to do that the recursive method hasn't already. (if
			// we didn't recurse (because y == bottomY), it would have executed a break, leaving wasOpaque equal to 0.)
			if (wasOpaque != 0) break;
		}
	}
	

	// NOTE: the code duplication between BlocksLight and SetVisible is for performance. don't refactor the octant
	// translation out unless you don't mind an 18% drop in speed
	blocksLight(x, y, octant, origin)
	{
		let nx = origin.x; let ny = origin.y;
		switch (octant) {
			case 0: nx += x; ny -= y; break;
			case 1: nx += y; ny -= x; break;
			case 2: nx -= y; ny -= x; break;
			case 3: nx -= x; ny -= y; break;
			case 4: nx -= x; ny += y; break;
			case 5: nx -= y; ny += x; break;
			case 6: nx += y; ny += x; break;
			case 7: nx += x; ny += y; break;
		}
		return this.fnBlocksLight(nx, ny);
	}

	setVisible(x, y, octant, origin)
	{
		let nx = origin.x; let ny = origin.y;
		switch (octant) {
			case 0: nx += x; ny -= y; break;
			case 1: nx += y; ny -= x; break;
			case 2: nx -= y; ny -= x; break;
			case 3: nx -= x; ny -= y; break;
			case 4: nx -= x; ny += y; break;
			case 5: nx -= y; ny += x; break;
			case 6: nx += y; ny += x; break;
			case 7: nx += x; ny += y; break;
		}
		this.fnSetVisible(nx, ny);
	}
}

class DiamondWallsVisibility extends Visibility {
	constructor(fnBlocksLight, fnSetVisible, fnGetDistance) {
		super();
		this.fnBlocksLight = fnBlocksLight;
		this.fnSetVisible = fnSetVisible;
		this.fnGetDistance = fnGetDistance;
	}

	compute(origin, rangeLimit)
	{
		this.fnSetVisible(origin.X, origin.Y);
		for(let octant=0; octant<8; octant++) {
			this.computeOctant(octant, origin, rangeLimit, 1, new Slope(1, 1), new Slope(0, 1));
		}
	} 


	computeOctant(octant, origin, rangeLimit, x, top, bottom)
	{
	  for(; int(x) <= int(rangeLimit); x++) // rangeLimit < 0 || x <= rangeLimit
	  {
		let topY;
		if(top.x == 1)
		{
		  topY = x;
		}
		else
		{
		  topY = ((x*2-1) * top.y + top.x) / (top.x*2); // get the tile that the top vector enters from the left
		  let ay = (topY*2+1) * top.x;
		  if(this.blocksLight(x, topY, octant, origin)) // if the top tile is a wall...
		  {
			if(top.greaterOrEqual(ay, x*2)) topY++; // but the top vector misses the wall and passes into the tile above, move up
		  }
		  else // the top tile is not a wall
		  {
			if(top.greater(ay, x*2+1)) topY++; // so if the top vector passes into the tile above, move up
		  }
		}
  
		let bottomY = bottom.y == 0 ? 0 : ((x*2-1) * bottom.y + bottom.x) / (bottom.x*2);
		let wasOpaque = -1; // 0:false, 1:true, -1:not applicable
		for(let y=topY; y >= bottomY; y--)
		{
		  let tx = origin.x, ty = origin.y;
		  switch(octant) // translate local coordinates to map coordinates
		  {
			case 0: tx += x; ty -= y; break;
			case 1: tx += y; ty -= x; break;
			case 2: tx -= y; ty -= x; break;
			case 3: tx -= x; ty -= y; break;
			case 4: tx -= x; ty += y; break;
			case 5: tx -= y; ty += x; break;
			case 6: tx += y; ty += x; break;
			case 7: tx += x; ty += y; break;
		  }
  
		  let inRange = rangeLimit < 0 || this.fnGetDistance(x, y) <= rangeLimit;
		  // NOTE: use the following line instead to make the algorithm symmetrical
		  // if(inRange && (y != topY || top.GreaterOrEqual(y, x)) && (y != bottomY || bottom.LessOrEqual(y, x))) SetVisible(tx, ty);
		  if(inRange) this.fnSetVisible(tx, ty);
  
		  let isOpaque = !inRange || this.fnBlocksLight(tx, ty);
		  // if y == topY or y == bottomY, make sure the sector actually intersects the wall tile. if not, don't consider
		  // it opaque to prevent the code below from moving the top vector up or the bottom vector down
		  if(isOpaque &&
			 (y == topY && top.lessOrEqual(y*2-1, x*2) && !this.blocksLight(x, y-1, octant, origin) ||
			  y == bottomY && bottom.greaterOrEqual(y*2+1, x*2) && !this.locksLight(x, y+1, octant, origin)))
		  {
			isOpaque = false;
		  }
  
		  if(x != rangeLimit)
		  {
			if(isOpaque)
			{
			  if(wasOpaque == 0) // if we found a transition from clear to opaque, this sector is done in this column, so
			  {                  // adjust the bottom vector upwards and continue processing it in the next column.
				// (x*2-1, y*2+1) is a vector to the top-left corner of the opaque block
				if(!inRange || y == bottomY) { bottom = new Slope(y*2+1, x*2); break; } // don't recurse unless necessary
				else this.computeOctant(octant, origin, rangeLimit, x+1, top, new Slope(y*2+1, x*2));
			  }
			  wasOpaque = 1;
			}
			else // adjust the top vector downwards and continue if we found a transition from opaque to clear
			{    // (x*2+1, y*2+1) is the top-right corner of the clear tile (i.e. the bottom-right of the opaque tile)
			  if(wasOpaque > 0) top = new Slope(y*2+1, x*2);
			  wasOpaque = 0;
			}
		  }
		}
  
		if(wasOpaque != 0) break; // if the column ended in a clear tile, continue processing the current sector
	  }
	}
  
	blocksLight(x, y, octant, origin)
	{
	  let nx = origin.x, ny = origin.y;
	  switch(octant)
	  {
		case 0: nx += x; ny -= y; break;
		case 1: nx += y; ny -= x; break;
		case 2: nx -= y; ny -= x; break;
		case 3: nx -= x; ny -= y; break;
		case 4: nx -= x; ny += y; break;
		case 5: nx -= y; ny += x; break;
		case 6: nx += y; ny += x; break;
		case 7: nx += x; ny += y; break;
	  }
	  return this.fnBlocksLight(nx, ny);
	}
}

// class AdamMilVisibilityRubyPortVisibility {
// 	constructor(fnBlocksLight, fnSetVisible, fnGetDistance) {
// 		this.fnBlocksLight = fnBlocksLight;
// 		this.fnSetVisible = fnSetVisible;
// 		this.fnGetDistance = fnGetDistance;
// 	}

// 	MULT = [
// 		[1,  0,  0,  1, -1,  0,  0, -1],  // xx
// 		[0,  1,  1,  0,  0, -1, -1,  0],  // xy
// 		[0,  1, -1,  0,  0, -1,  1,  0],  // yx
// 		[1,  0,  0, -1, -1,  0,  0,  1]   // yy
// 	   ] 

// 	doFov(floorplan, entity) {
// 	   let x = entity.x , y = entity.y;
// 	   let fovID 
// 	   fov_id, radius = entity.fov_id, entity.fov_r + 0.5
// 	   light(map, fov_id, x, y)
// 	   8.times do |oct|
// 		 cast_light(map, fov_id, oct, x, y, radius, 1, 1.0, 0.0,
// 		   @@mult[0][oct], @@mult[1][oct],
// 		   @@mult[2][oct], @@mult[3][oct])
// 	   end
// 	 end
// }
