export class Packet {
  private operation: string;
  private data: any;

  public constructor(operation: string, data: any) {
    this.operation = operation;
    this.data = data;
  }

  getOperation(): string {
    return this.operation;
  }

  getData(): any {
    return this.data;
  }

  hasData(): boolean {
    return this.data !== null && this.data !== undefined;
  }
}
