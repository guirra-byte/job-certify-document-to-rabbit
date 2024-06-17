import { Message } from "amqplib";
import { rabbitMqServer } from "..";
import CertifyDocumentModel from "./CertifyDocumentModel";

const execute = async (topic: string, msg: Message) => {
  const data = JSON.parse(msg.content.toString());

  const modifyStatus = await CertifyDocumentModel.modified(data.id);
  if (!modifyStatus[0]) {
    const topicPattern = topic.split(".");
    const queue = topicPattern[topicPattern.length - 1];
    rabbitMqServer._channel.assertQueue(queue);

    if (queue === "processed") await CertifyDocumentModel.setProcessed(data);
    else if (queue === "errored") await CertifyDocumentModel.setErrored(data);
  }
};

const CertifyDocumentModelConsumer = async () => {
  const docsCertificationStatusTopic = "docs.certification";
  rabbitMqServer._channel.assertExchange(
    `${docsCertificationStatusTopic}.*`,
    "topic"
  );

  const topics = [
    `${docsCertificationStatusTopic}.processed`,
    `${docsCertificationStatusTopic}.errored`,
  ];

  for (const topic of topics) {
    rabbitMqServer._channel.consume(
      topic,
      async (msg: Message) => await execute(topic, msg)
    );
  }
};

CertifyDocumentModelConsumer();
