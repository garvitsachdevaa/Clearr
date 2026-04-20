A Vite + React project called roomie-finance has already been scaffolded. Firebase, React Router v7, and Tailwind CSS v4 are already installed. The existing files include firebase.js, AuthContext.jsx, HouseContext.jsx, basic service files, and partial page implementations. You are building on top of this existing base — do not re-scaffold or re-install anything.

What We're Building
A real-time shared expense and chore manager for roommates. Users create a "house", invite members via a 6-digit code, log shared expenses with flexible split options, track net balances correctly, settle debts, rotate chores, and see a live activity feed.

Ground Rules (Non-Negotiable, Follow in Every File)

All components must be functional components using hooks only
Folder structure: /components, /pages, /hooks, /context, /services, /utils
AuthContext exposes: user, profile, setProfile, loading
HouseContext exposes: house, members, loading
All Firestore calls go inside /services files only — never import db directly in a component or page
All forms must be controlled components — every input has a value and onChange tied to state
Every useEffect that sets up a Firestore listener must return the unsubscribe function
Use useMemo for all derived data (balances, filtered lists, computed totals)
Use useCallback for every function that is passed as a prop to a child component
Lazy load every page except Login and Signup using React.lazy — wrap all lazy routes in a single Suspense with a Spinner fallback
Every .map() must use the Firestore document ID as the key
Every async action must have: a loading boolean that disables the submit button, and an error string displayed near the action
No inline styles anywhere — Tailwind utility classes only
Keep components focused — if JSX exceeds ~80 lines, split it


Firestore Collections — Exact Schema
users/{uid}
displayName: string
email: string
houseId: string | null
houses/{houseId}
name: string
inviteCode: string
members: string[]   ← array of uids
createdAt: timestamp
expenses/{expenseId}
houseId: string
title: string
amount: number          ← total amount
paidBy: string          ← uid
splitType: "equal" | "exact" | "percentage"
splits: { [uid]: number }  ← each person's share in rupees (always stored in rupees regardless of splitType)
createdAt: timestamp
settlements/{settlementId}
houseId: string
fromUid: string
toUid: string
amount: number
createdAt: timestamp
chores/{choreId}
houseId: string
title: string
assignedTo: string      ← uid
rotationOrder: string[] ← array of uids
createdAt: timestamp
activity/{activityId}
houseId: string
actorName: string
message: string
timestamp: timestamp

Balance Model — Read This Carefully Before Writing Any Balance Code
Balances are stored as a flat directed map: balances[debtorUid][creditorUid] = amount.
This means: debtor owes creditor that amount in rupees.
Rules:

When an expense is added, for each person in splits (excluding paidBy), add splits[uid] to balances[uid][paidBy]
When a settlement is recorded (fromUid paid toUid), subtract settlement.amount from balances[fromUid][toUid]. If the result goes negative, it means toUid now owes fromUid — flip it: set balances[toUid][fromUid] = Math.abs(result) and delete balances[fromUid][toUid]
Never use alphabetical sorting of UIDs to determine direction. Always use explicit debtor/creditor keys
The useBalances hook returns this map. Components read it by checking balances[currentUser][otherUid] (you owe them) and balances[otherUid][currentUser] (they owe you)
Settlement amount must be capped at the actual debt. If you owe ₹200, the settle modal should pre-fill ₹200 and not allow submission above that amount


⚠️ Important Instruction
After completing each phase, stop completely and output:

A list of every file created or modified
A list of features that are now working
A short list of things the user must manually test

Do not proceed to the next phase until the user says "continue".

Phase 0 — Audit & Fix Existing Files
Read every existing file in the project. Then do the following:
Fix App.jsx:

Add the missing /chores route with a lazy-loaded Chores page
Confirm all routes are: /login, /signup, /create-join, /dashboard, /expenses, /chores, /settle
/login and /signup are public. All others use ProtectedRoute
ProtectedRoute: if no user → /login. If user but no houseId → /create-join. Otherwise render children
AuthRoute (for /create-join): if no user → /login. If user has houseId → /dashboard. Otherwise render children

Fix HouseContext.jsx:

Member profiles must not be re-fetched on every house snapshot. Fetch them once when the members array changes. Cache the result in a useRef keyed by the members array joined as a string. Only re-fetch if the members list actually changed
Add a membersMap to the context value: an object of { [uid]: profile } for O(1) name lookup in components

Fix AuthContext.jsx:

After onAuthStateChanged fires with a user, re-fetch the Firestore profile inside the listener so that profile.houseId is always fresh. Do not rely on the cached profile for routing decisions

Fix CreateJoin.jsx:

After creating or joining a house, do not mutate setProfile locally. Instead call the getUserProfile service function and call setProfile with the full fresh profile object fetched from Firestore

Fix ProtectedRoute.jsx and AuthRoute.jsx:

Both must wait for loading === false before making any redirect decision. While loading, render Spinner only

Fix Navbar.jsx:

Remove setProfile from the logout handler. On logout, only call logOut() and navigate to /login. AuthContext's onAuthStateChanged will automatically set user and profile to null
Add a NavLink to /chores

Confirm vite.config.js uses both the React plugin and the Tailwind plugin. Do not change it if it already does.

Phase 1 — Expense Splits Overhaul
This is the most important phase. Replace the hardcoded equal split with a flexible 3-mode split system.
Build /src/components/expenses/SplitEditor.jsx
This is a self-contained component that receives members, totalAmount, splitType, splits, and onChange as props.
It renders three tabs: Equal, Exact, Percentage.
Equal tab:

Show all members with checkboxes
All checked by default
The share shown next to each member is totalAmount / checkedCount, updated live as amount changes
onChange fires with splits as { [uid]: totalAmount / checkedCount } for checked members only

Exact tab:

Show all members with a number input each
User types in rupee amounts per person
Show a running total and highlight it red if it doesn't equal totalAmount
Disable the submit button (via a valid prop returned from onChange) if amounts don't sum to total
onChange fires with splits as { [uid]: enteredAmount } for members with a non-zero amount

Percentage tab:

Show all members with a percentage input each
Show running total percentage and highlight red if it doesn't equal 100
Disable submit if percentages don't sum to 100
Convert internally: splits[uid] = (percentage / 100) * totalAmount before calling onChange
onChange fires with splits in rupees always

Update /src/components/expenses/AddExpenseForm.jsx

Add splitType state defaulting to "equal"
Add splits state (object)
Add splitsValid state (boolean, defaults true)
Render SplitEditor below the amount field, passing all required props
On submit, validate splitsValid === true before proceeding
Write to Firestore with splitType and splits map (in rupees)
Remove perPersonShare and splitAmong — they no longer exist

Update /src/services/expenseService.js

addExpense now receives { title, amount, paidBy, splitType, splits } — no splitAmong, no perPersonShare
Write splits directly as received (already in rupees)

Update /src/components/expenses/ExpenseCard.jsx

Display split breakdown: for each uid in splits, show memberName: ₹amount
Use membersMap from HouseContext for O(1) name lookup


Phase 2 — Balance Calculator Rewrite
Delete the existing useBalances.js and rewrite it from scratch.
/src/hooks/useBalances.js
Subscribe to expenses and settlements in real time using onSnapshot.

Build the balance map as follows:

  const balances = {}  // balances[debtorUid][creditorUid] = rupeesOwed

  function addDebt(debtor, creditor, amount) {
    if (debtor === creditor || amount <= 0) return

    // Check if creditor already owes debtor (reverse debt exists)
    const reverse = balances[creditor]?.[debtor] ?? 0
    if (reverse > 0) {
      // Net off against reverse
      const net = amount - reverse
      if (net > 0) {
        delete balances[creditor][debtor]
        if (!balances[debtor]) balances[debtor] = {}
        balances[debtor][creditor] = net
      } else if (net < 0) {
        balances[creditor][debtor] = -net
      } else {
        delete balances[creditor][debtor]
      }
    } else {
      if (!balances[debtor]) balances[debtor] = {}
      balances[debtor][creditor] = (balances[debtor][creditor] ?? 0) + amount
    }
  }

  For each expense:
    for (const [uid, share] of Object.entries(expense.splits)) {
      addDebt(uid, expense.paidBy, share)
    }

  For each settlement:
    addDebt(settlement.toUid, settlement.fromUid, settlement.amount)

Wrap the entire map construction in useMemo. Return { balances, expenses, settlements }.
/src/utils/balanceHelpers.js
Export two functions:

getAmountYouOwe(balances, currentUid, otherUid) → returns number (0 if no debt)
getAmountTheyOwe(balances, currentUid, otherUid) → returns number (0 if no debt)

These are the only functions components should use to read balances. Never let components read the raw balances map directly.
Update BalanceSummary.jsx
Use getAmountYouOwe and getAmountTheyOwe for every row. Iterate over all members excluding the current user. Skip pairs where both values are 0.

Phase 3 — Settle Up Page Rewrite
Update /src/pages/Settle.jsx
Outstanding Balances section:

For each member (excluding current user), check getAmountYouOwe and getAmountTheyOwe
If you owe them: show red "You owe ₹X" and a Settle Up button
If they owe you: show green "Owes you ₹X" — no button
Skip members where both are 0

Update /src/components/settle/SettleModal.jsx

Pre-fill amount with the exact debt amount
Set max attribute on the amount input to the debt amount
On change, if user types above the max, clamp it back and show "Cannot exceed ₹X"
On confirm: call addSettlement. The amount is now guaranteed to be ≤ actual debt

Update /src/services/settlementService.js

addSettlement signature unchanged. No changes needed here.


Phase 4 — Dashboard Page
/src/pages/Dashboard.jsx
Two sections:
Balances section — render BalanceSummary
Activity Feed section — render ActivityFeed
Show the house invite code somewhere visible on the dashboard (e.g. a small chip or card at the top): "Invite code: A3K9PZ — share with flatmates". Use house.inviteCode from HouseContext.

Phase 5 — Chores Page
/src/services/choreService.js

subscribeToChores(houseId, callback) — real-time listener ordered by createdAt ascending
addChore(houseId, title, members) — creates chore with rotationOrder = members.map(m => m.uid), assignedTo = rotationOrder[0]
markChoreDone(houseId, choreId, currentRotationOrder, currentAssignedTo, actorName, choreTitle) — advances assignedTo to the next uid in rotationOrder, wraps around. Writes activity entry
deleteChore(houseId, choreId) — deletes document

/src/pages/Chores.jsx

Navbar at top
"Add Chore" button in header — lifts form open/close state to the page
Render ChoreBoard below

/src/components/chores/AddChoreForm.jsx

Modal with a single text input for chore title
On submit: call addChore with house.id, title, and members from HouseContext
Show loading and error states

/src/components/chores/ChoreBoard.jsx

Subscribe to chores in real time
For each chore, render a ChoreItem

/src/components/chores/ChoreItem.jsx

Shows chore title and assigned person's name (look up from membersMap)
"Mark Done" button — calls markChoreDone with useCallback
Delete button — calls deleteChore with useCallback
Shows loading state per chore (not global) using a local loading state


Phase 6 — Activity Feed
/src/components/ActivityFeed.jsx already exists. Verify it:

Uses onSnapshot with limit(20) and orderBy('timestamp', 'desc')
Cleans up on unmount
Shows loading, empty state, and list correctly
Uses timeAgo from formatTime.js

If any of these are missing, fix them. Otherwise leave it.

Phase 7 — UI Polish Pass
Go through every page and component and apply the following:
Loading states:

Every page that fetches data must show a Spinner while loading
Every button that triggers an async action must show a text change ("Saving…", "Adding…") and be disabled during the action

Error states:

Every form must show errors inside a styled red box near the submit button
Errors must clear when the user starts typing again (set error to "" in the onChange handler)

Empty states:

Expenses page: show an icon and "No expenses yet. Add the first one."
Chores page: show an icon and "No chores yet. Add one to get started."
Activity feed: show "No activity yet."
Settle page (no balances): show "You're all settled up!"

Responsive layout:

All pages must work on 375px mobile width
Navbar must collapse to a hamburger menu on mobile
All modals must be full-screen bottom sheets on mobile (items-end on small screens, items-center on sm and above)
All cards must stack vertically on mobile

Consistency:

All primary buttons: bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors
All destructive buttons (delete): text-gray-300 hover:text-red-400 transition-colors
All card containers: bg-white rounded-xl border border-gray-200
All section headings: text-base font-semibold text-gray-700 mb-3
Page max-width: max-w-2xl mx-auto px-4 py-8


Phase 8 — Final Build Check
Run through this checklist and fix anything that fails:

 npm run build completes with zero errors and zero warnings
 Open Network tab in browser — confirm separate JS chunks load for lazy pages (Dashboard, Expenses, Chores, Settle)
 Sign up as User A → create a house → note the invite code
 Sign up as User B in another tab → join with the invite code → confirm both users appear in the house
 User A adds an expense with equal split → confirm it appears for both users in real time
 User A adds an expense with exact split (unequal amounts) → confirm splits are stored and displayed correctly
 User A adds an expense with percentage split → confirm rupee amounts are calculated and stored correctly
 Settle page shows correct "you owe" direction for both users
 User B settles up → confirm balance drops to zero, not negative
 Settle modal does not allow amount above actual debt
 Add a chore → mark it done → confirm it rotates to the next person
 Delete an expense → confirm it disappears in real time for both users
 Activity feed shows all events in correct order
 Log out → confirm redirect to login → confirm back button does not show protected pages
 Resize to 375px → confirm all pages are usable on mobile
 Invite code is visible on the Dashboard