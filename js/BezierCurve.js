class BezierCurve extends THREE.Curve {
    constructor(points_array = new Array()) {
        super();
        this.type = 'BezierCurve';
        this.points = points_array;
        this.degree = this.points.length - 1;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        optionalTarget = new THREE.Vector3();
        for (let i = 0; i <= this.degree; ++i) {
            let point = this.points[i].clone();
            optionalTarget.add(
                point.multiplyScalar(bernstein_pol(t, this.degree, i))
                );
        }
        return optionalTarget;
    }

    addToScene(scene, addControlPoints, color, line_color) {
        const points = super.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });

        // Create the final object to add to the scene
        scene.add(new THREE.Line(geometry, material));
        if (addControlPoints) {
            for (let i = 0; i < this.points.length; ++i) {
                add_point(scene, this.points[i], color);
                if (i > 0) {
                    //add lines
                    const line_points = [this.points[i - 1], this.points[i]];
                    const geometry = new THREE.BufferGeometry().setFromPoints(line_points);
                    const material = new THREE.LineBasicMaterial({ color: line_color });
                    scene.add(new THREE.Line(geometry, material));
                }
            }
        }
    }

    copy(source) {
        super.copy(source);
        this.points = [];
        for (let i = 0; i < source.points.length; ++i) {
            this.points[i] = source.points[i];
        }
        return this;
    }

    toJSON() {
        const data = super.toJSON();
        data.points[i] = [];
        for (let i = 0; i < this.points.length; ++i) {
            data.points[i] = this.points[i].toArray();
        }
        return data;
    }

    fromJSON(json) {
        super.fromJSON(json);
        this.points = [];
        for (let i = 0; i < json.points.length; ++i) {
            let vec = new Vector3(0, 0, 0);
            vec.fromArray(json.points[i]);
            this.points[i] = vec;
        }
        return this;
    }
}