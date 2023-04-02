export function deepCompare (obj1, obj2) {
  // Check if both are objects and not null
  if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {

    // If the number of properties is different, the objects are not equal
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }

    // Iterate through the properties of obj1
    for (var key in obj1) {
      // If obj2 doesn't have the same property or their values are different, the objects are not equal
      if (!obj2.hasOwnProperty(key) || !deepCompare(obj1[key], obj2[key])) {
        return false
      }
    }

    // If all properties and values match, the objects are deeply equal
    return true

  } else {
    // If both are not objects (or are null), simply compare their values
    return obj1 === obj2
  }
}

export function randomString (length = 8) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export default {
  deepCompare,
  randomString
}
