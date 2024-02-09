/** Returns true if the string contains only letters, numbers, and underscores in between, false otherwise */
function validStringName(str) {
    return /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str.toUpperCase());
}

module.exports = { validStringName };