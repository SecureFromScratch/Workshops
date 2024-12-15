export function combineButExclude(...args) {
    const excludeFields = new Set();
    const objectsToMerge = [];

    // First pass: Build exclusion set and collect objects
    for (const arg of args) {
        if (Array.isArray(arg)) {
            for (const field of arg) {
                excludeFields.add(field);
            }
        } else if (typeof arg === 'object' && arg !== null) {
            objectsToMerge.push(arg);
        }
    }

    // Second pass: Merge objects, excluding specified fields
    const combinedResult = {};
    for (const obj of objectsToMerge) {
        for (const [key, value] of Object.entries(obj)) {
            if (!excludeFields.has(key)) {
                combinedResult[key] = value;
            }
        }
    }

    return combinedResult;
}

// Example usage
//const obj1 = { a: 1, b: 2, c: 3 };
//const obj2 = { b: 20, d: 4, e: 5 };
//const exclude = ["b", "e"];

//const result = combineButExclude(obj1, obj2, exclude);
//console.log(result); // { a: 1, c: 3, d: 4 }
