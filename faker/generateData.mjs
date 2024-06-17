import knex from 'knex'
import { randomUUID } from 'crypto'
import 'dotenv/config'

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  }
})

const generateData = async (maxGen = 100) => {
  for (let i = 0; i < maxGen; i++) {
    await db('certify_documents').insert({
      id: randomUUID(),
      user_id: randomUUID(),
      file: Buffer.from(randomUUID()).toString('base64'),
      status: 1,
      message: '',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
  }
  await db.destroy()
}

generateData(1000)



/**
 * SQL

  CREATE TABLE clients.certify_documents (
    id varchar(100) NOT NULL,
    user_id varchar(100) NOT NULL,
    file LONGTEXT NULL,
    status INT DEFAULT 1 NOT NULL,
    message TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
  )
  ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

 */