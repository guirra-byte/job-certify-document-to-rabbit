import db from "../configs/databases/KnexConfig";
import { CertifyDocumentsStatusEnum } from "../enums/CertifyDocumentsEnums";

/**
 * 1. Persistência do Consumidor: Cada vez que um método que declara um consumidor é
 * chamado, ele tenta criar um novo consumidor. Isso pode resultar em múltiplos
 * consumidores para a mesma fila se o método for chamado várias vezes, o que pode não ser desejado.
 * 2. Duplicação de Consumidores: Se os métodos setProcessed, setErrored ou setOnQueue forem chamados
 * repetidamente, novos consumidores serão criados, potencialmente
 * duplicando o trabalho e causando concorrência desnecessária.
 * 3. Gerenciamento de Recursos: Muitos consumidores conectados podem sobrecarregar os recursos do RabbitMQ e
 * do servidor onde o código está sendo executado, especialmente se não forem gerenciados corretamente.
 */

class CertifyDocumentModel {
  async getPendings(limit: number = 1000): Promise<ICertifyDocumentModel[]> {
    return await db("certify_documents")
      .where({
        status: CertifyDocumentsStatusEnum.PENDING,
      })
      .limit(limit)
      .select("*");
  }

  async setProcessed(data: {
    id: string;
    consumer_owner: string;
  }): Promise<void> {
    await db("certify_documents").where("id", data.id).update({
      consumer_owner: data.consumer_owner,
      status: CertifyDocumentsStatusEnum.PROCESSED,
      updated_at: new Date(),
    });
  }

  async setErrored(data: {
    id: string;
    consumer_owner: string;
    message: string;
  }): Promise<void> {
    await db("certify_documents").where("id", data.id).update({
      consumer_owner: data.consumer_owner,
      status: CertifyDocumentsStatusEnum.ERRORED,
      message: data.message,
      updated_at: new Date(),
    });
  }

  async modified(id: string): Promise<ICertifyDocumentModel[]> {
    return await db("certify_documents").where("id", id);
  }
}

export default new CertifyDocumentModel();

interface ICertifyDocumentModel {
  id: string;
  file: string;
  status: number;
  message: string;
  created_at: Date;
  updated_at: Date;
}
