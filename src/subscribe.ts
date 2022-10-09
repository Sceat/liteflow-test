import EventEmitter, { on } from 'events'

import { aiter } from 'iterator-helper'

import parse_struct from './parse_struct'
import logger from './logger'

const log = logger(import.meta)

export default ({ contract, insert }) =>
  () =>
    // @see https://docs.opensea.io/v2.0/reference/seaport-events-and-errors#orderfulfilled
    // simpky creating an async iterable here for a more elegant (and functionnal) style
    aiter(on(contract as unknown as EventEmitter, 'OrderFulfilled'))
      // mapping the event to an object we can store
      // since we will execute a query per row, we flatMap each item sale (offer array)
      .flatMap(([tx_hash, seller, , buyer, offer, consideration]) => {
        log.info({ seller }, 'sold an item')
        return offer.map(parse_struct).map(({ token, identifier, amount }) => [
          tx_hash, // this is actually the orderHash but not sure how to get a tx hash from that
          seller,
          buyer,
          identifier, // token_id
          token, // collection
          amount, // sold_quantity
          consideration.map(parse_struct).reduce(
            // Computing the paid amount seems a bit tricky,
            // not much time to deep dive into it but when the ItemType is not 0 (not ETH)
            // then retrieving the monetary value of the spentItem require more context
            () => 1n,
            0n
          ), // amount paid
        ])
      })
      // even with https://github.com/brianc/node-postgres/issues/2692
      // i'm unable to *cleanly* insert multiple rows (json doesn't support bigint)
      // string interpolation is a bit ugly
      // it'll be enough for this test project to just do a query per row
      .forEach(insert)
