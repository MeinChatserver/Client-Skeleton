export class Category {
  private readonly id: number | null = null;
  private readonly name: string | null = null;

  constructor(data: any) {
    if(data.id) {
      this.id = data.id;
    }

    if(data.name) {
      this.name = data.name;
    }
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }
}
