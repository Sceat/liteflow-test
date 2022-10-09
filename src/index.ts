import PG from 'pg'
import 'dotenv/config'
import { ethers } from 'ethers'

import logger from './logger'
import ABI from './seaport.abi.json' assert { type: 'json' }
import { POSTGRE_ENDPOINT, WS_RPC_ENDPOINT, SEAPORT_CONTRACT } from './env'
import subscribe from './subscribe'

const log = logger(import.meta)
const client = new PG.Client({ connectionString: POSTGRE_ENDPOINT })

// this dependency injection allows us to test the code with no IO
const context = {
  contract: new ethers.Contract(
    SEAPORT_CONTRACT,
    ABI,
    new ethers.providers.WebSocketProvider(WS_RPC_ENDPOINT)
  ),
  insert: values =>
    client.query({
      text: /* sql */ `INSERT INTO sales VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values,
    }),
}

const CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS sales (
    tx_hash CHAR(66), -- length of 64 prefixed with 0X
    seller CHAR(42),
    buyer CHAR(42),
    token_id NUMERIC(78), -- numeric(78) is an uint256
    collection CHAR(42),
    sold_quantity NUMERIC(78),
    amount_paid NUMERIC(78)
  );
`
log.info('connecting to DB..')

await client
  .connect()
  .then(() => log.info('verifying table..'))
  .then(() => client.query(CREATE_TABLE))
  .then(() => log.info('connected!'))
  .catch(error => log.error(error))
  .then(subscribe(context))
