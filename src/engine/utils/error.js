class ResourceNotFoundError extends Error {
  constructor(resourcePath) {
    super(`Resource isn't found. Maybe used wrong path. Image path is: '${resourcePath}'`);
    this.name = "ResourceNotFoundError";
  }
}

export {
  ResourceNotFoundError
}