/**
 *  Adapted from https://github.com/domasx2/mrpas-js/blob/master/mrpas.js
 */

function createMRPASVisibility(){
    return new MRPAS(
        (x,y) => { return !gameState.currentFloor().get(x, y).isTransparent(); },
        (x,y) => { gameState.currentFloor().get(x, y).hasLineOfSight = true; },
        (x,y) => { return gameState.currentFloor().get(x, y).hasLineOfSight; },
        (x,y) => { return Math.sqrt(x ** 2 + y ** 2); }
    );
}
    
class MRPAS extends Visibility {
    constructor(fnBlocksLight, fnSetVisible, fnIsVisible, fnGetDistance) {
        super();
        this.fnBlocksLight = fnBlocksLight;
        this.fnGetDistance = fnGetDistance;
        this.fnIsVisible = fnIsVisible;
        this.fnSetVisible = fnSetVisible;
    }
    
    compute_quadrant(position, maxRadius, dx, dy){
        var startAngle = new Array();
        startAngle[99]=undefined;
        var endAngle = startAngle.slice(0);
        //octant: vertical edge:
        var iteration = 1;
        var done = false;
        var totalObstacles = 0;
        var obstaclesInLastLine = 0;
        var minAngle = 0.0;
        var x = 0.0;
        var y = position[1] + dy;
        var c;
        var wsize = [MAP_WIDTH, MAP_HEIGHT];
        
        var slopesPerCell, halfSlopes, processedCell, minx, maxx, pos, visible, 
            startSlope, centreSlope, endSlope, idx;
        //do while there are unblocked slopes left and the algo is within
        // the map's boundaries
        //scan progressive lines/columns from the PC outwards
        if( (y < 0) || (y >= wsize[1]))  done = true;
        while(!done){
            //process cells in the line
            slopesPerCell = 1.0 / (iteration + 1);
            halfSlopes = slopesPerCell * 0.5;
            processedCell = parseInt(minAngle / slopesPerCell);
            minx = Math.max(0, position[0] - iteration);
            maxx = Math.min(wsize[0] - 1, position[0] + iteration);
            done = true;
            x = position[0] + (processedCell * dx);
            while((x >= minx) && (x <= maxx)){
                pos = [x, y];
                visible = true;
                startSlope = processedCell * slopesPerCell;
                centreSlope = startSlope + halfSlopes;
                endSlope = startSlope + slopesPerCell;
                if ((obstaclesInLastLine > 0) && (!this.fnIsVisible(pos[0], pos[1]))){
                    idx = 0;
                    while(visible && (idx < obstaclesInLastLine)){
                        if (!this.fnBlocksLight(pos[0], pos[1])){
                            if((centreSlope > startAngle[idx]) && (centreSlope < endAngle[idx]))
                                visible = false;
                        }
                        else if ((startSlope >= startAngle[idx]) && (endSlope <= endAngle[idx]))
                                visible = false;
                        if (visible && ((!this.fnIsVisible(x, y-dy)) ||
                                (this.fnBlocksLight(x, y-dy)))
                                && ((x - dx >= 0) && (x - dx < wsize[0]) &&
                                ((!this.fnIsVisible(x-dx, y-dy)) ||
                                (this.fnBlocksLight(x-dx, y-dy))))) {
                            visible = false;
                        }
                        idx += 1;
                }
                }
                if(visible){
                    this.fnSetVisible(pos[0], pos[1]);
                    done = false;
                    //if the cell is opaque, block the adjacent slopes
                    if (this.fnBlocksLight(pos[0], pos[1])){
                        if(minAngle >= startSlope) minAngle = endSlope;
                        else{
                            startAngle[totalObstacles] = startSlope;
                            endAngle[totalObstacles] = endSlope;
                            totalObstacles += 1;
                        }
                    }
                }
                processedCell += 1;
                x += dx;
            }
            if(iteration == maxRadius) done = true;
            iteration += 1;
            obstaclesInLastLine = totalObstacles;
            y += dy;
            if((y < 0) || (y >= wsize[1])) done = true;
            if(minAngle == 1.0) done = true;
        }
        
        //octant: horizontal edge
        iteration = 1; //iteration of the algo for this octant
        done = false;
        totalObstacles = 0;
        obstaclesInLastLine = 0;
        minAngle = 0.0;
        x = (position[0] + dx); //the outer slope's coordinates (first processed line)
        y = 0;
        //do while there are unblocked slopes left and the algo is within the map's boundaries
        //scan progressive lines/columns from the PC outwards
        if((x < 0) || (x >= wsize[0])) done = true;
        while(!done){
            //process cells in the line
            slopesPerCell = 1.0 / (iteration + 1);
            halfSlopes = slopesPerCell * 0.5;
            processedCell = parseInt(minAngle / slopesPerCell);
            let miny = Math.max(0, position[1] - iteration);
            let maxy = Math.min(wsize[1] - 1, position[1] + iteration);
            done = true;
            y = position[1] + (processedCell * dy);
            while((y >= miny) && (y <= maxy)){
                //calculate slopes per cell
                pos = [x, y];
                visible = true;
                startSlope = (processedCell * slopesPerCell);
                centreSlope = startSlope + halfSlopes;
                endSlope = startSlope + slopesPerCell;
                if ((obstaclesInLastLine > 0) && (!this.fnIsVisible(pos[0], pos[1]))){
                    idx = 0;
                    while(visible && (idx < obstaclesInLastLine)){
                        if (!this.fnBlocksLight(pos[0], pos[1])){
                            if((centreSlope > startAngle[idx]) && (centreSlope < endAngle[idx])) visible = false;
                        }
                        else if((startSlope >= startAngle[idx]) && (endSlope <= endAngle[idx])) visible = false;
                            
                        if(visible && (!this.fnIsVisible(x-dx, y) ||
                                (this.fnBlocksLight(x-dx, y))) &&
                                ((y - dy >= 0) && (y - dy < wsize[1]) &&
                                ((!this.fnIsVisible(x-dx, y-dy)) ||
                                (this.fnBlocksLight(x-dx, y-dy))))) visible = false;
                        idx += 1;
                    }
                }
                if(visible){
                    this.fnSetVisible(pos[0], pos[1]);
                    done = false;
                    //if the cell is opaque, block the adjacent slopes
                    if (this.fnBlocksLight(pos[0], pos[1])){
                        if(minAngle >= startSlope) minAngle = endSlope;
                        else{
                            startAngle[totalObstacles] = startSlope;
                            endAngle[totalObstacles] = endSlope;
                            totalObstacles += 1;
                        }
                    }
                }
                processedCell += 1;
                y += dy;
            }
            if(iteration == maxRadius) done = true;
            iteration += 1;
            obstaclesInLastLine = totalObstacles;
            x += dx;
            if((x < 0) || (x >= wsize[0])) done = true;
            if(minAngle == 1.0) done = true;
        }
    }      


    compute(position, vision_range){
            this.fnSetVisible(position[0], position[1]);
            //compute the 4 quadrants of the map
            this.compute_quadrant(position, vision_range, 1, 1);
            this.compute_quadrant(position, vision_range, 1, -1);
            this.compute_quadrant(position, vision_range, -1, 1);
            this.compute_quadrant(position, vision_range, -1, -1);
    }

}