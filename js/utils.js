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

function n_over_i(n, i) {
    return factorial(n) / (factorial(i) * factorial(n - i));
}

function bernstein_pol(t, n, i) {
    return n_over_i(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
}

function parse_curves_file(file, curves, on_done) {
    let textType = /text.*/;
    if (file.type.match(textType))
    {
        let reader = new FileReader();
        reader.onload = function(e)
        {
            let content = e.target.result;
            let begin = content.indexOf("{");
            let end = content.indexOf("}");
            while (begin != end && begin != -1 && end != - 1) {   
                let curve_points = [];                  
                let vectors_portion = content.slice(begin + 1, end)
                let vec_start = vectors_portion.indexOf("(");
                let vec_end = vectors_portion.indexOf(")");
                while (vec_start != vec_end && vec_start != -1 && vec_end != -1) {
                    let numbers = vectors_portion.slice(vec_start + 1, vec_end).split(',').map(Number);
                    curve_points.push(new THREE.Vector3().fromArray(numbers));
                    vectors_portion = vectors_portion.substr(vec_end + 1);
                    vec_start = vectors_portion.indexOf("(");
                    vec_end = vectors_portion.indexOf(")");
                }

                content = content.substr(end + 1);
                begin = content.indexOf("{");
                end = content.indexOf("}");
                curves.push(curve_points);
            }
            on_done();
        }

        reader.readAsText(file);	
    }
}