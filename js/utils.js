function add_point(scene, point, color) {
    let dotGeometry = new THREE.BufferGeometry();
    let points_array = [];
    point.toArray(points_array);
    dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points_array, 3));
    let dotMaterial = new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, color: color });
    let dot = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dot);
}

function add_distance(scene, points, color=0x6A5ACD) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({ color: color, dashSize: 0.3, gapSize: 0.2 });

    // Create the final object to add to the scene
    let line = new THREE.Line(geometry, material);
    line.computeLineDistances();    
    scene.add(line);
    add_point(scene, points[0], color);
    add_point(scene, points[1], color);
}

function factorial(num) {
    let rval = 1;
    for (let i = 2; i <= num; i++) {
        rval = rval * i;
    }
    return rval;
}

function nOverI(n, i) {
    return factorial(n) / (factorial(i) * factorial(n - i));
}

function bernsteinPol(t, n, i) {
    return nOverI(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
}