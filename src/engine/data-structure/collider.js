class Collider {
  constructor(type) {
    this.type = type;
  }
}

class BoxCollider extends Collider {
  constructor() {
    super("box");
  }
}

class CircleCollider extends Collider {
  constructor() {
    super("circle");
  }
}

export { BoxCollider, CircleCollider };
