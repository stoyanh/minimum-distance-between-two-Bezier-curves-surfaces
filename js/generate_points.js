// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

let a = 8
let b = -5
let c = 4
let d = 10

function generatePoint() {
    //ax + by + cz + d = 0
    //(d - (a*x) - (b*y))/c;
    
    let x1 = Math.random() * 20
    let y1 = Math.random() * 20
    let z1 = (-d - a * x1 - b * y1) / c
    
    return [x1, y1, z1]
}

let [x1, y1, z1] = generatePoint()

console.log("(", x1, ",", y1, ",", z1, ")")

console.log(a*x1 + b*y1 + c*z1 + d)   