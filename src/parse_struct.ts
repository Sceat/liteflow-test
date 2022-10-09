export default fields =>
  Object.fromEntries(
    Object.entries(fields)
      // @ts-ignore
      .filter(([key]) => isNaN(key))
      .map(([key, value]) => {
        // @ts-ignore
        if (value._isBigNumber) return [key, value.toBigInt()]
        return [key, value]
      })
  )
