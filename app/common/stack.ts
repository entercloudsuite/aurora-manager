/**
 * Custom stack class used to save available services
 * 
 * @export
 * @class Stack
 */
export class Stack {
  public items: string[];

  constructor() {
    this.items = [];
  };

  public push(element: string) {
    this.items.push(element);
  }

  public pop(): string {
    return this.items.pop();
  }

  public update(): string {
    const item = this.items.pop();
    this.items.unshift(item);
    return item;
  }
  
  public peek(): string {
    return this.items[this.items.length - 1];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public empty() {
    this.items = [];
  }
}