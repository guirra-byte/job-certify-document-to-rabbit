import { Request, Response } from "express";
import ICertifyDocumentModel from "../models/CertifyDocumentModel";
import { rabbitMqServer } from "..";

class StatusController {
  async pendings(req: Request, res: Response) {
    const data = await ICertifyDocumentModel.getPendings();
    res.json({ quantity: data.length, data });
  }

  async followDocuments(req: Request, res: Response) {
    res
      .writeHead(202, "", {
        "cache-control": "no-cache",
        connection: "keep-alive",
        "content-type": "text/event-stream",
      })
      .flushHeaders();

    rabbitMqServer.consume("follow-docs", (msg: any) => {
      const parseMsg = JSON.parse(msg.toString());
      res.json(parseMsg);
    });
  }
}

export default new StatusController();
