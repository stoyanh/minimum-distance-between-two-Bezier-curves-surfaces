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

function next_part(str, start_sym, end_sym) {
    let begin = str.indexOf(start_sym);
    if (begin != -1) {
        ++begin;
    }
    const end = str.indexOf(end_sym);
    const part = str.slice(begin, end)
    const remaining = str.substr(end + 1);
    return {part, remaining};
}

function next_object_part(str) {
    return next_part(str, "{", "}");
}

function next_vecs_part(str) {
    return next_part(str, "(", ")");
}

function substr(str, range) {
    return str.slice(range.begin, range.end);
}

function parse_curves_file(file, curves, on_done) {
    let textType = /text.*/;
    if (file.type.match(textType))
    {
        let reader = new FileReader();
        reader.onload = function(e)
        {
            let content = e.target.result;
            let curve_part = next_object_part(content);
            while (curve_part.part.length > 0) {   
                let curve_points = [];                  
                let vecs_part = next_vecs_part(curve_part.part);
                while (vecs_part.part.length > 0) {
                    let numbers = vecs_part.part.split(',').map(Number);
                    curve_points.push(new THREE.Vector3().fromArray(numbers));
                    vecs_part = next_vecs_part(vecs_part.remaining);
                }

                curve_part = next_object_part(curve_part.remaining);
                curves.push(curve_points);
            }
            on_done();
        }

        reader.readAsText(file);	
    }
}