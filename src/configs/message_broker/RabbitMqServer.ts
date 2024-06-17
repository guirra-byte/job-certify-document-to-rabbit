import { Channel, Connection, connect } from "amqplib";

export class RabbitMqServer {
  private channel: Channel;
  private connection: Connection;

  async start() {
    this.connection = await connect(process.env.RABBITMQ_CONNECTION_URL);
    this.channel = await this.connection.createChannel();
  }

  async publish(queue: string, message: string, persistent: boolean = false, headers: any = {}) {
    await this.channel.assertQueue(queue);
    this.channel.publish("", queue, Buffer.from(message), {
      persistent,
      headers
    });

    return;
  }

  async consume(queue: string, cb: (msg: any) => void) {
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, cb);
    return;
  }

  get _channel() {
    return this.channel;
  }
}
