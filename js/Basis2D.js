    class Basis2D {
        constructor(origin, xAxis, yAxis) {
            this.origin = origin;
            this.xAxis = xAxis;
            this.yAxis = yAxis;
        }

        // Function to convert 3D point to 2D coordinates
        convertTo2D(point) {
            var pointVector = point.clone().sub(this.origin);
            var x = pointVector.dot(this.xAxis);
            var y = pointVector.dot(this.yAxis);
            return new THREE.Vector3(x, y, 0)
        }

        // Function to convert 2D coordinates back to 3D point
        convertTo3D(point) {
            let x = point.x, y = point.y;
            var point2D = new THREE.Vector3(x, y, 0);
            var point3D = this.origin.clone();
            point3D.addScaledVector(this.xAxis, point2D.x);
            point3D.addScaledVector(this.yAxis, point2D.y);
            return point3D;
        }
    }