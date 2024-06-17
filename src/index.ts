import "dotenv/config";
import express from "express";
import routes from "./routes/api.routes";
import CertifyDocumentCronJob from "./crons/CertifyDocumentCronJob";
import { RabbitMqServer } from "./configs/message_broker/RabbitMqServer";
const app = express();

app.use(express.json());
app.use(routes);

const rabbitMqServer = new RabbitMqServer();
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await rabbitMqServer.start();
  console.log(`Server is running on port ${PORT}`);
});

CertifyDocumentCronJob.start();
export { rabbitMqServer };
