import { CronJob } from "cron";
import CertifyDocumentModel from "../models/CertifyDocumentModel";
import { rabbitMqServer } from "..";
import { ConsumerLoadBalancer } from "../configs/message_broker/ConsumerLoadBalancer";
import CertifyDocumentUseCaseConsumer from "../use-cases/CertifyDocumentUseCaseConsumer";

class CertifyDocumentCronJob {
  private isCronRunning: boolean = false;
  public start() {
    new CronJob(
      "*/5 * * * * *",
      async () => {
        if (this.isCronRunning) {
          return;
        }

        this.isCronRunning = true;
        const PENDING_LIMIT = 1000;
        const PERCENTAGE_PER_CONSUMER = 10;
        const PREFETCH_LIMIT = Math.floor(
          PENDING_LIMIT * (PERCENTAGE_PER_CONSUMER / 100)
        );

        const currentRabbitMqChannel = rabbitMqServer._channel;
        /** When we use prefetch we need to use ack or unack declarations on consumers; */
        await currentRabbitMqChannel.prefetch(PREFETCH_LIMIT);
        const pendings = await CertifyDocumentModel.getPendings(PENDING_LIMIT);
        const consumers = [];

        for (
          let instance = 0;
          instance < Math.floor(PENDING_LIMIT / PREFETCH_LIMIT);
          instance++
        ) {
          const consumerTag = await CertifyDocumentUseCaseConsumer();
          if (!consumers.includes(consumerTag)) {
            consumers.push(consumerTag);
          }
        }

        const consumerLoadBalancer = new ConsumerLoadBalancer(consumers);

        for (
          let pendingIndex = 0;
          pendingIndex < pendings.length;
          pendingIndex++
        ) {
          let consumerOwner = consumerLoadBalancer.getConsumerByIndex(0);
          if (pendingIndex % PREFETCH_LIMIT === 0) {
            consumerOwner = consumerLoadBalancer.getNextConsumer();
          }

          const data = JSON.stringify({
            ...pendings[pendingIndex],
            consumer_owner: consumerOwner,
          });

          const certifyDocsPattern = "docs.certification.go";
          currentRabbitMqChannel.assertQueue("certify");
          currentRabbitMqChannel.assertExchange("to_certify", "direct");
          currentRabbitMqChannel.bindQueue(
            "certify",
            "to_certify",
            certifyDocsPattern
          );

          currentRabbitMqChannel.publish(
            "to_certify",
            certifyDocsPattern,
            Buffer.from(data)
          );
        }

        this.isCronRunning = false;
      },
      null,
      true,
      "America/Sao_Paulo"
    );
  }
}

export default new CertifyDocumentCronJob();
