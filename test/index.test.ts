import EventEmitter from 'events'
import assert from 'assert'
import { setTimeout } from 'timers/promises'

import { describe, it } from 'mocha'

import subscribe from '../src/subscribe'

const DB = new Set()
const context = {
  contract: new EventEmitter(),
  insert: values => DB.add(values),
}

// blocking
subscribe(context)().catch(console.error)

describe('Liteflow Test', async () => {
  it('an OrderFulfilled event correctly store itself in the DB', async () => {
    context.contract.emit(
      'OrderFulfilled',
      ...[
        'tx_hash',
        'seller',
        null,
        'buyer',
        [{ token: 'token', identifier: 0n, amount: 1n }],
        [{}],
      ]
    )

    await setTimeout(1)

    assert.deepEqual([...DB.values()][0], [
      'tx_hash',
      'seller',
      'buyer',
      0n,
      'token',
      1n,
      1n,
    ])
  })
})
