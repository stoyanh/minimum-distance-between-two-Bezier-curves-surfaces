class Grid2d {
    static divisions = 100;

    constructor(maxX, maxY) {
        this.gridSizeX = Math.ceil(maxX);
        this.gridSizeY = Math.ceil(maxY);
        this.gridDensityX = this.gridSizeX / Grid2d.divisions;
        this.gridDensityY = this.gridSizeY / Grid2d.divisions;
        this.grid = [];
        for (let i = 0; i < Grid2d.divisions ; ++i) {
            this.grid.push([]);
            for (let j = 0; j < Grid2d.divisions; ++j) {
                this.grid[i].push(new THREE.Vector3(i * this.gridDensityX, j * this.gridDensityY, 0));
            }
        }
    }

}