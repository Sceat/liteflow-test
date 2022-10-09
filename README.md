# Liteflow-test

<p align="center">
  <img src="https://i.imgur.com/szZfv6i.png" />
</p>

> This project is a technical skills test

A basic service to read and expose new NFT sales on opensea

## Usage

```
git clone https://github.com/Sceat/liteflow-test
cd liteflow-test
npm i
```

Create a **.env** file

```
POSTGRE_ENDPOINT=
WS_RPC_ENDPOINT=
```

```
npm start
```

### Run the Graphql API

```
npm run graphql -- \
  --connection $POSTGRE_ENDPOINT \
  --jwt-secret $JWT_SECRET
```

![](https://i.imgur.com/coAsq8L.png)

## Tests

```
npm test
```

## Thoughts process

This service is quite basic, not a lot of thoughts to give,

- Listening to a seaport event
- Transforming the values into a storable object
  - Computing the paid amount seems a bit tricky, not much time to deep dive into it but when the ItemType is not 0 (not ETH) then retrieving the monetary value of the spentItem require more context
- Storing the object

```sql
CREATE TABLE IF NOT EXISTS sales (
  tx_hash CHAR(66), -- length of 64 prefixed with 0X
  seller CHAR(42),
  buyer CHAR(42),
  token_id NUMERIC(78), -- numeric(78) is an uint256
  collection CHAR(42),
  sold_quantity NUMERIC(78),
  amount_paid NUMERIC(78)
);
```

Having to use typescript is quite a drawback on the simplicity of node, i didn't manage to make NYC coverage works along with ESM and TS
