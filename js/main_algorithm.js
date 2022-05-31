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

function algorithm(curve1_points, curve2_points, ubound)
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
        const data1121 = algorithm(c11, c21, ubound)
        if (data1121["length"] < ubound) {
            res = {...data1121};
        }
        const data1122 = algorithm(c11, c22, ubound);
        if (data1122["length"] < ubound) {
            res = {...data1122};
        }
        const data1221 = algorithm(c12, c21, ubound);
        if (data1221["length"] < ubound) {
            res = {...data1221};
        }
        const data1222 = algorithm(c12, c22, ubound);
        if (data1221["length"] < ubound) {
            res = {...data1222};
        }
    }
    return res;
}
