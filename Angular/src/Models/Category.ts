export class Category {
  id: number | null;
  name: string;

  constructor(id: number | null, name: string) {
    this.id = id;
    this.name = name;
  }
}
