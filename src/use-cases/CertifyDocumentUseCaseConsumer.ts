import { Message } from "amqplib";
import { rabbitMqServer } from "..";
import { CertifyDocumentUseCase } from "./CertifyDocumentUseCase";

const execute = async (msg: Message) => {
  const data = JSON.parse(msg.content.toString());

  const certifyDocsTopicPrefix = "docs.certification";
  rabbitMqServer._channel.assertExchange("event", "topic");
  rabbitMqServer._channel.bindQueue(
    "follow_docs",
    "event",
    `${certifyDocsTopicPrefix}.*`
  );

  try {
    const docsCertifiedTopic = `${certifyDocsTopicPrefix}.processed`;
    await CertifyDocumentUseCase(data.file);

    rabbitMqServer._channel.assertQueue(docsCertifiedTopic);
    rabbitMqServer._channel.publish(
      "event",
      docsCertifiedTopic,
      Buffer.from(data)
    );
  } catch (err: any) {
    const docsUncertifiedTopic = `${certifyDocsTopicPrefix}.errored`;
    const errData = { message: err.message, ...data };
    
    rabbitMqServer._channel.assertQueue(docsUncertifiedTopic);
    rabbitMqServer._channel.publish(
      "event",
      docsUncertifiedTopic,
      Buffer.from(`${errData}`)
    );
  }

  rabbitMqServer._channel.ack(msg);
};

const CertifyDocumentUseCaseConsumer = async () => {
  const consumer = await rabbitMqServer._channel.consume(
    "certify",
    (msg: Message) => execute(msg)
  );

  return consumer.consumerTag;
};

export default CertifyDocumentUseCaseConsumer;
