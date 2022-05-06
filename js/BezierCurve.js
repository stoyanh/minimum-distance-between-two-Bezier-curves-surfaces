// import { Vector3 } from "three.js"
// import { Curve } from "three.js"

class BezierCurve extends THREE.Curve {
    constructor(points_array = new Array()) {
        super();
        this.type = 'BezierCurve';
        this.points = points_array;
        this.degree = this.points.length - 1;
    }

    #factorial(num) {
        var rval = 1;
        for (var i = 2; i <= num; i++)
            rval = rval * i;
        return rval;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const point = optionalTarget
        let x = 0, y = 0, z = 0;
        const nfact = this.#factorial(this.degree);
        for (let i = 0; i <= this.degree; ++i) {
            const noveri = nfact / (this.#factorial(i) * this.#factorial(this.degree - i));
            const coef1 = Math.pow(1 - t, this.degree - i);
            const coef2 = Math.pow(t, i);
            x += noveri * coef1 * coef2 * this.points[i].x;
            y += noveri * coef1 * coef2 * this.points[i].y;
            z += noveri * coef1 * coef2 * this.points[i].z;
        }
        point.set(x, y, z);
        return point;
    }

    addToScene(scene, addControlPoints, color, line_color) {
        const points = super.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });

        // Create the final object to add to the scene
        scene.add(new THREE.Line(geometry, material));
        if (addControlPoints) {
            for (let i = 0; i < this.points.length; ++i) {
                var dotGeometry = new THREE.BufferGeometry();
                let points_array = [];
                this.points[i].toArray(points_array);
                dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points_array, 3));
                var dotMaterial = new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, color: color });
                var dot = new THREE.Points(dotGeometry, dotMaterial);
                scene.add(dot);

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