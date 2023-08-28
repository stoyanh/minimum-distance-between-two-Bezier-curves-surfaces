class Grid2d {
    static divisions = 3000;

    constructor(maxX, maxY) {
        this.gridSize = Math.ceil(maxX) >  Math.ceil(maxY) ?  Math.ceil(maxX) :  Math.ceil(maxY);
        this.gridDensity = this.gridSize / Grid2d.divisions;
        this.grid = [];
        for (let i = 0; i < Grid2d.divisions ; ++i) {
            this.grid.push([]);
            for (let j = 0; j < Grid2d.divisions; ++j) {
                this.grid[i].push(new THREE.Vector3(i * this.gridDensity, j * this.gridDensity, 0));
            }
        }
    }

}