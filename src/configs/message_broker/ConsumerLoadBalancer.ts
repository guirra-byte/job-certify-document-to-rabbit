export class ConsumerLoadBalancer {
  private consumers: string[];
  private currentIndex: number;

  constructor(private readonly _consumers: string[]) {
    this.consumers = this._consumers;
    this.currentIndex = -1;
  }

  getNextConsumer() {
    this.currentIndex = (this.currentIndex - 1) % this.consumers.length;
    return this.consumers[this.currentIndex];
  }

  getConsumerByIndex(index: number) {
    return this.consumers[index];
  }
}
