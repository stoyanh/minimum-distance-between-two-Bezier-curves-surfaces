///////////// utils
function calculatePointForParameters(parameters, controlPoints)
{
        //De Casteljau's algorithm
    if (!Array.isArray(parameters) || parameters.length != (controlPoints.length - 1))
    {
        alert("Invalid input(calulate curve point)");
        return;
    }

    if (controlPoints.length == 1)
        return controlPoints[0];

    let points = controlPoints.slice();
    let iteration = 0;
    while (points.length != 1)
    {
        let t = parameters[iteration];
        let newPoints = [];
        for (let i = 1; i < points.length; ++i)
        {
            let point = points[i - 1].clone().multiplyScalar(1 - t);
            point.add(points[i].clone().multiplyScalar(t));
            newPoints.push(point); 
        }

        ++iteration;
        points = newPoints.slice();
    }

    return points[0];
}

function controlPointsForCurveInRange(tMin, tMax, points)
{
    //using blossom

    let controlPoints = [];
    let iterationCount = 0;
    let pointsCount = points.length;

    let parameters = new Array(pointsCount - 1);
    for (var i = 0; i < pointsCount; ++i)
    {
        parameters.fill(tMin, 0, parameters.length - i);
        parameters.fill(tMax, parameters.length - i, pointsCount);
        var newPoint = calculatePointForParameters(parameters, points);
        controlPoints.push(newPoint);
    }

    return controlPoints;
}


function controlPointsForSurfaceInRange(domain, points)
{
    let new_points = [];
    for (let i = 0; i < points.length; ++i) {
        new_points.push(controlPointsForCurveInRange(domain.uMin, domain.uMax, points[i]));
    }
    new_points = transpose_2d_array(new_points);
    for (let i = 0; i < new_points.length; ++i) {
        new_points[i] = controlPointsForCurveInRange(domain.vMin, domain.vMax, new_points[i]);
    }
    new_points = transpose_2d_array(new_points);
    return new_points;
}

function upper_bound(curve1_points, curve2_points)
{
    //choose the end control points as there lie on the curves and we can select the min
    //distance between them as upper bound
    const c1_0 = curve1_points[0];
    const c1_n = curve1_points[curve1_points.length - 1];
    const c2_0 = curve2_points[0];
    const c2_m = curve2_points[curve2_points.length - 1];
    let ubound = c1_0.clone().sub(c2_0).length();
    let res = {"length": ubound,
               "point1": c1_0,
               "point2": c2_0};
    if (c1_0.clone().sub(c2_m).length() < ubound) {
        ubound = c1_0.clone().sub(c2_m).length();
        res = {"length": ubound,
               "point1": c1_0,
               "point2": c2_m};
    }
    if (c1_n.clone().sub(c2_0).length() < ubound) {
        ubound = c1_n.clone().sub(c2_0).length();
        res = {"length": ubound,
               "point1": c1_n,
               "point2": c2_0};
    }
    if (c1_n.clone().sub(c2_m).length() < ubound) {
        ubound = c1_n.clone().sub(c2_m).length();
        res = {"length": ubound,
               "point1": c1_n,
               "point2": c2_m};
    }
    return res;
}

function upper_bound_surfaces(sf_points1, sf_points2) {
    let ub00 = upper_bound(sf_points1[0], sf_points2[0])
    let ub0m = upper_bound(sf_points1[0], sf_points2[sf_points2.length - 1]);
    let ubn0 = upper_bound(sf_points1[sf_points1.length - 1], sf_points2[0]);
    let ubnm = upper_bound(sf_points1[sf_points1.length - 1], sf_points2[sf_points2.length - 1]);
    let res = ub00;
    if (ub0m["length"] < res["length"]) {
        res = ub0m;
    }
    if (ubn0["length"] < res["length"]) {
        res = ubn0;
    }
    if (ubnm["length"] < res["length"]) {
        res = ubnm;
    }
    return res;
}

function lower_bound_data(curve1_points, curve2_points)
{
   return gjk_min_dist(curve1_points, curve2_points);
}

function subdivision_parameter(lambdas) {
    let res = 0;
    for (let i = 0; i < lambdas.length; ++i) {
        res += (lambdas[i] * i) / (lambdas.length - 1);
    }
    return res; 
}

function subdivision_parameters_2(lambdas) {
    let u = 0;
    let v = 0;
    const n = lambdas.length;
    const m = lambdas[0].length;
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < m; ++j) {
          u += (lambdas[i][j] * i) / (n - 1);
          v += (lambdas[i][j] * j) / (m - 1);
      }
    }

    return {u, v};
}

function min_dist_algorithm(curve1_points, curve2_points, ubound)
{
    const tolerance = 0.00000001;
    let ub_data = upper_bound(curve1_points, curve2_points);
    if (ub_data["length"] <= ubound) {
        ubound = ub_data["length"];
    }
    let res = {...ub_data};
    const lb_data = lower_bound_data(curve1_points, curve2_points);
    if (lb_data["length"] >= ubound * (1 - tolerance)) {
        return res;
    }
    else {
        const subdivision_param1 = subdivision_parameter(lb_data["lambdas1"]);
        const subdivision_param2 = subdivision_parameter(lb_data["lambdas2"]);
        const c11 = controlPointsForCurveInRange(0, subdivision_param1, curve1_points);
        const c12 = controlPointsForCurveInRange(subdivision_param1, 1, curve1_points);
        const c21 = controlPointsForCurveInRange(0, subdivision_param2, curve2_points);
        const c22 = controlPointsForCurveInRange(subdivision_param2, 1, curve2_points);
        const data1121 = min_dist_algorithm(c11, c21, ubound)
        if (data1121["length"] < ubound) {
            ubound = data1121["length"];
            res = {...data1121};
        }
        const data1122 = min_dist_algorithm(c11, c22, ubound);
        if (data1122["length"] < ubound) {
            ubound = data1122["length"];
            res = {...data1122};
        }
        const data1221 = min_dist_algorithm(c12, c21, ubound);
        if (data1221["length"] < ubound) {
            ubound = data1221["length"];
            res = {...data1221};
        }
        const data1222 = min_dist_algorithm(c12, c22, ubound);
        if (data1222["length"] < ubound) {
            ubound = data1222["length"];
            res = {...data1222};
        }
    }
    return res;
}

function subdivde_surface(domain, subdivion_params) {
    let u_dom_larger = domain.uMax - domain.uMin >= domain.vMax - domain.vMin;
    if (u_dom_larger) {
        return [{
            "uMin": domain.uMin,
            "uMax": domain.uMin + subdivion_params.u * (domain.uMax - domain.uMin),
            "vMin": domain.vMin,
            "vMax": domain.vMax
        },  {
            "uMin": domain.uMin + subdivion_params.u * (domain.uMax - domain.uMin),
            "uMax": domain.uMax,
            "vMin": domain.vMin,
            "vMax": domain.vMax
     }];
    }
    else {
        return [{
            "uMin": domain.uMin,
            "uMax": domain.uMax,
            "vMin": domain.vMin,
            "vMax": domain.vMin + subdivion_params.v * (domain.vMax - domain.vMin)
        }, {
            "uMin": domain.uMin,
            "uMax": domain.uMax,
            "vMin": domain.vMin + subdivion_params.v * (domain.vMax - domain.vMin),
            "vMax": domain.vMax
    }];
    }
}

function equal_domains(dm1, dm2) {
    return dm1.uMin == dm2.uMin && dm1.uMax == dm2.uMax && dm1.vMin == dm2.vMin && dm1.vMax == dm2.vMax;
}

function min_dist_algorithm_surfaces(sf_points1, sf1_domain, sf_points2, sf2_domain, ubound)
{
    const tolerance = 0.3;
    const sf1_domain_points = controlPointsForSurfaceInRange(sf1_domain, sf_points1);
    const sf2_domain_points = controlPointsForSurfaceInRange(sf2_domain, sf_points2);
    let ub_data = upper_bound_surfaces(sf1_domain_points, sf2_domain_points);
    if (ub_data["length"] <= ubound) {
        ubound = ub_data["length"];
    }
    let res = {...ub_data};
    const lb_data = lower_bound_data(sf1_domain_points.flat(), sf2_domain_points.flat());
    if (lb_data["length"] >= ubound * (1 - tolerance)) {
        return res;
    }
    else {
        const subdivision_params1 = subdivision_parameters_2(arr_to_2d(lb_data["lambdas1"], sf_points1[0].length));
        const subdivision_params2 = subdivision_parameters_2(arr_to_2d(lb_data["lambdas2"], sf_points2[0].length));

        const div_domains_sf1 = subdivde_surface(sf1_domain, subdivision_params1);
        const div_domains_sf2 = subdivde_surface(sf2_domain, subdivision_params2);
        if (!equal_domains(div_domains_sf1[0], sf1_domain) && !equal_domains(div_domains_sf2[0], sf2_domain)) {
            const data1121 = min_dist_algorithm_surfaces(sf_points1, div_domains_sf1[0], sf_points2, div_domains_sf2[0], ubound);
            if (data1121["length"] < ubound) {
                ubound = data1121["length"];
                res = {...data1121};
            }
        }
        if (!equal_domains(div_domains_sf1[0], sf1_domain) && !equal_domains(div_domains_sf2[1], sf2_domain)) {
            const data1122 = min_dist_algorithm_surfaces(sf_points1, div_domains_sf1[0], sf_points2, div_domains_sf2[1], ubound)
            if (data1122["length"] < ubound) {
                ubound = data1122["length"];
                res = {...data1122};
            }
        }
        if (!equal_domains(div_domains_sf1[1], sf1_domain) && !equal_domains(div_domains_sf2[0], sf2_domain)) {
            const data1221 = min_dist_algorithm_surfaces(sf_points1, div_domains_sf1[1], sf_points2, div_domains_sf2[0], ubound)
            if (data1221["length"] < ubound) {
                ubound = data1221["length"];
                res = {...data1221};
            }
        }
        if (!equal_domains(div_domains_sf1[1], sf1_domain) && !equal_domains(div_domains_sf2[1], sf2_domain)) {
            const data1222 = min_dist_algorithm_surfaces(sf_points1, div_domains_sf1[1], sf_points2, div_domains_sf2[1], ubound)
            if (data1222["length"] < ubound) {
                ubound = data1222["length"];
                res = {...data1222};
            }
        }
    }
    return res;
}
