class BezierSurface {
    constructor(points_array = new Array()) {
        this.points = points_array;
        this.degree = this.points.length - 1;
        this.n_degree = points_array.length - 1;
        this.m_degree = points_array[0].length - 1;
    }

    getPoint(u, v) {
        let res = new THREE.Vector3();
        for (let i = 0 ; i <= this.n_degree; ++i) {
            for (let j = 0; j <= this.m_degree; ++j) {
                let point = this.points[i][j].clone();
                res.add(
                    point.multiplyScalar(
                        bernstein_pol(u, this.n_degree, i)*
                        bernstein_pol(v, this.m_degree, j))
                );
            }
        }
        return res;
    }

    addToScene(scene, addControlPoints, color) {
        const geometry = new THREE.ParametricGeometry( (u, v, vec) => vec.copy(this.getPoint(u, v)), 50, 50 );
        const material = new THREE.MeshBasicMaterial( { color: color, wireframe:true } );
        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        if (addControlPoints) {
            for (let i = 0; i < this.points.length; ++i) {
                for (let j = 0; j < this.points[i].length; ++j) {
                    add_point(scene, this.points[i][j], 0x00ff00, 6);
                }
            }
        }
    }
};