export function simplifyDebts(balances, members) {
  if (members.length < 2) return []

  const net = {}
  members.forEach((m) => { net[m.uid] = 0 })

  members.forEach((m) => {
    members.forEach((other) => {
      if (m.uid === other.uid) return
      net[other.uid] += balances[m.uid]?.[other.uid] ?? 0
      net[m.uid] -= balances[m.uid]?.[other.uid] ?? 0
    })
  })

  // Recompute cleanly: net[uid] = total owed to uid - total uid owes
  const netBalance = {}
  members.forEach((m) => {
    let owedToMe = 0
    let iOwe = 0
    members.forEach((other) => {
      if (other.uid === m.uid) return
      owedToMe += balances[other.uid]?.[m.uid] ?? 0
      iOwe += balances[m.uid]?.[other.uid] ?? 0
    })
    netBalance[m.uid] = owedToMe - iOwe
  })

  if (Object.values(netBalance).every((v) => Math.abs(v) < 0.01)) return []

  const nameMap = Object.fromEntries(members.map((m) => [m.uid, m.displayName]))

  const debtors = members
    .filter((m) => netBalance[m.uid] < -0.01)
    .map((m) => ({ uid: m.uid, name: nameMap[m.uid], amount: Math.abs(netBalance[m.uid]) }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = members
    .filter((m) => netBalance[m.uid] > 0.01)
    .map((m) => ({ uid: m.uid, name: nameMap[m.uid], amount: netBalance[m.uid] }))
    .sort((a, b) => b.amount - a.amount)

  const transactions = []
  let i = 0, j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const settleAmount = Math.min(debtor.amount, creditor.amount)

    if (settleAmount > 0.01) {
      transactions.push({
        fromUid: debtor.uid,
        fromName: debtor.name,
        toUid: creditor.uid,
        toName: creditor.name,
        amount: Math.round(settleAmount * 100) / 100,
      })
    }

    debtor.amount -= settleAmount
    creditor.amount -= settleAmount

    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return transactions.sort((a, b) => b.amount - a.amount)
}
