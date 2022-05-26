function extreme_point(shape_points, dir) {
    let res_point = new THREE.Vector3(0, 0, 0);
    let max_dot_product = Number.MIN_SAFE_INTEGER; 
    for (let i = 0; i < shape_points.length; ++i) {
        if (shape_points[i].dot(dir) > max_dot_product) {
            max_dot_product = shape_points[i].dot(dir);
            res_point = shape_points[i].clone();
        }
    }
    return res_point;
}

function support_point(shape1, shape2, dir) {
    const first = extreme_point(shape1, dir);
    const second = extreme_point(shape2, dir.negate());
    let res = first.sub(second);
    return res;
}

//////////////////// cofactors

function calc_points_cofactors1(points) {
    return [1];
}

function calc_points_cofactors2(points) {
    const cofactor1 = calc_cofactor([points[1]], points[0]);
    const cofactor2 = calc_cofactor([points[0]], points[1]);
    return [cofactor1, cofactor2];
}

function calc_points_cofactors3(points) {
    const cofactor1 = calc_cofactor([points[1], points[2]], points[0]);
    const cofactor2 = calc_cofactor([points[0], points[2]], points[1]);
    const cofactor3 = calc_cofactor([points[0], points[1]], points[2]);
    return [cofactor1, cofactor2, cofactor3];
}

function calc_cofactors(points) {
    if (points.length == 1) {
        return calc_points_cofactors1(points);
    }
    else if (points.length == 2) {
        return calc_points_cofactors2(points);
    }
    else if (points.length == 3) {
        return calc_points_cofactors3(points);
    }
    else {
        alert("Too many points");
        return [];
    }
}

function calc_cofactor(points, new_point) {
    const deltas = calc_cofactors(points);
    let sum = 0;
    for (let i = 0; i < points.length; ++i) {
        sum += deltas[i] * (points[i].dot(points[0]) - points[i].dot(new_point));
    }
    return sum; 
}

/* array of complement indices of an array with indices 
 * E.g index_array = [0, 2] and points_count = 4
 * return [1, 3]; 
 */
function complement_indices(index_array, points_count) {
    let res = [];
    for (let i = 0; i < points_count; ++i) {
        if (index_array.find(el => el == i) === undefined) {
            res.push(i);
        }
    }
    return res;
}

/* all subsets of indices of the points */
function all_subsets(points) {
    let res = [];
    //add the newest point, others don't have to be tested
    res.push([points.length - 1]);
    if (points.length >= 2) {
        for (let i = 0; i < points.length - 1; ++i) {
            //have to contain the newest point
            res.push([i, points.length - 1]);
        }
    }
    if (points.length >= 3) {
        for (let i = 0; i < points.length - 2; ++i) {
            for (let j = i + 1; j < points.length - 1; ++j) {  
                res.push([i, j, points.length - 1]);
            }
        }
    }
    return res;
}

function all_positive(cofactors) {
    for (let i = 0; i < cofactors.length; ++i) {
        if (cofactors[i] < 0) {
            return false;
        }
    }
    return true;
}

function generate_subset(points, indices) {
    let res = [];
    indices.forEach(index => {
        res.push(points[index]);
    });
    return res;
}

function all_complement_cofactors_non_positive(points, subset) {
    const complements = complement_indices(subset, points.length);
    const points_subset = generate_subset(points, subset);
    for (let k = 0; k < complements.length; ++k) {
        if (calc_cofactor(points_subset, points[complements[k]]) > 0) {
            return false;
        }
    }
    return true;
}

function compute_dist_and_set(points) {
    lambdas = [];
    set = [];
    const subsets = all_subsets(points);
    for (let i = 0; i < subsets.length; ++i) {
        const subset = subsets[i];
        const points_subset = generate_subset(points, subset);
        const cofactors = calc_cofactors(points_subset);
        if (all_positive(cofactors) && all_complement_cofactors_non_positive(points, subset)) {
            const cofactors_sum = cofactors.reduce((a, b) => a + b, 0);
            for (let j = 0; j < cofactors.length; ++j) {
                lambdas.push(cofactors[j] / cofactors_sum);
            }
            set = points_subset;
            break; 
        }
    }
    if (lambdas.length == 0 || set.length == 0) {
        alert("Error when computing dist and set!");
    }

    return {lambdas, set};
}

function gjk_min_dist(curve1_points, curve2_points)
{
    let points_set = [];
    let lower_bound = 0;
    const EPS = 0.0001;
    //closest point
    let v = curve1_points[0].clone();
    v.sub(curve2_points[0]);
    let close_enough = false;
    const null_vector = new THREE.Vector3(0, 0, 0);
    let iteration = 0;
    //store dirs associated to points
    //we can get extreme points for the 2 curves using the dirs
    let points_dir_map = new Map();
    while (!close_enough && !v.equals(null_vector)) {
        //new simplex point
        w = support_point(curve1_points, curve2_points, v.clone().negate());
        const dist_to_support_plane = v.dot(w) / v.length();
        lower_bound = Math.max(lower_bound, dist_to_support_plane);
        close_enough = v.length() - lower_bound <= EPS;
        if (!close_enough) {
            points_set.push(w);
            points_dir_map.set(w.toArray().toString(), v.clone().negate());
            if (points_set.length > 1) {
                const lambdas_and_points = compute_dist_and_set(points_set);
                points_set = lambdas_and_points.set;
                const lambdas = lambdas_and_points.lambdas;
                v = new THREE.Vector3();
                for (let i = 0; i < lambdas.length; ++i) {
                    v.add(points_set[i].clone().multiplyScalar(lambdas[i]));
                }
                /*
                * delete removed points from points_dir_map
                */
                for (const vec_str of points_dir_map.keys()) {
                    const el = points_set.find(element => element.toArray().toString() == vec_str);
                    if (el === undefined) {
                        points_dir_map.delete(vec_str);
                    }
                }
            } 
            else {
                v = w;
            }
        }
        ++iteration;
    }

    //determine the exact closest point
    let point_curve1 = new THREE.Vector3();
    let point_curve2 = new THREE.Vector3();
    for (let i = 0; i < points_set.length; ++i) {
        let dir = points_dir_map.get(points_set[i].toArray().toString()).clone();
        const point1 = extreme_point(curve1_points, dir);
        const point2 = extreme_point(curve2_points, dir.negate());
        point_curve1.add(point1.multiplyScalar(lambdas[i]));
        point_curve2.add(point2.multiplyScalar(lambdas[i]));
    }
    return {
        "point1": point_curve1,
        "point2": point_curve2,
        "length": v.length()
    };
}