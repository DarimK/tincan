/** Returns true if the input is an object that contains string values for all specified keys, false otherwise */
function validInput(input, keys) {
    if (!input)
        return false;
    for (key of keys)
        if (typeof input[key] !== "string")
            return false;
    return true;
}

/** Returns true if the string contains only letters, numbers, and underscores in between, false otherwise */
function validStringName(str) {
    return /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str.toUpperCase());
}

module.exports = { validInput, validStringName };