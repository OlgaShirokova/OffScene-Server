export function mutateNullToUndefined(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null) {
      obj[key] = undefined;
    }
  });
  return obj;
}
