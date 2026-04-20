export function getAmountYouOwe(balances, currentUid, otherUid) {
  return balances[currentUid]?.[otherUid] ?? 0
}

export function getAmountTheyOwe(balances, currentUid, otherUid) {
  return balances[otherUid]?.[currentUid] ?? 0
}
