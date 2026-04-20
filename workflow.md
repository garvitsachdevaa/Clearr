# RoomieFinance — Claude Code Build Prompt

## What We're Building
A real-time shared expense and chore manager for roommates. Users create a "house", invite members via a 6-digit code, log shared expenses that auto-split equally, track balances, settle debts, and rotate chores. Built entirely in React with Firebase as the backend.

---

## Ground Rules (Follow Throughout Every Phase)

- Stack: React (Vite), Firebase Auth + Firestore, React Router v6, Tailwind CSS
- All components must be functional components using hooks
- Folder structure must be: `/components`, `/pages`, `/hooks`, `/context`, `/services`, `/utils`
- Use Context API for global state — AuthContext and HouseContext
- All Firebase calls go inside `/services` files only — never call Firebase directly from a component
- All forms must be controlled components
- Use `useEffect` for all Firestore listeners, and always clean up with `return () => unsubscribe()`
- Use `useMemo` for any derived calculations (especially balance math)
- Use `useCallback` for any function passed as a prop
- Lazy load all pages except Login and Signup using `React.lazy` and wrap in `Suspense`
- Every list rendered with `.map()` must have a unique `key` (use Firestore doc IDs)
- Every async action must have a loading state and an error state displayed in the UI
- No inline styles — Tailwind classes only
- Keep components small and reusable — if a chunk of UI repeats, extract it

---

## Firestore Collections (Do Not Deviate)

- `users` — one doc per user, contains displayName, email, houseId (null if not in a house)
- `houses` — one doc per house, contains name, inviteCode, members array (array of uids)
- `expenses` — one doc per expense, contains houseId, title, amount, paidBy uid, splitAmong array, perPersonShare, isSettled
- `settlements` — one doc per settlement, contains houseId, fromUid, toUid, amount
- `chores` — one doc per chore, contains houseId, title, assignedTo uid, rotationOrder array
- `activity` — one doc per event, contains houseId, actorName, message, timestamp

---

## ⚠️ Important Instruction for Claude Code

**After completing each phase, stop and list exactly:**
1. Which files were created
2. Which features are now working
3. What the user should manually test before moving to the next phase

Do not start the next phase until told to continue.

---

## Phase 0 — Project Setup

Scaffold a new Vite React project called `roomie-finance`. Install React Router v6, Firebase, and Tailwind CSS. Configure Tailwind. Create the full folder structure with empty placeholder files. Create the Firebase config file that reads all keys from environment variables. Add a `.env` file with placeholders for all Firebase keys and add it to `.gitignore`. Set up Firestore security rules so that only authenticated users can read and write documents inside a house they belong to. Do not build any UI yet.

---

## Phase 1 — Authentication

Build full email/password authentication using Firebase Auth.

Create AuthContext that listens to Firebase auth state changes using `onAuthStateChanged`. It should expose the Firebase user object, the Firestore user profile document, and a loading boolean. Wrap the entire app in AuthProvider. While loading, render nothing.

Build a Signup page that takes displayName, email, and password. On signup, create the Firebase Auth user, update their display name, and create a document in the `users` collection with houseId set to null.

Build a Login page with email and password.

Build a ProtectedRoute component. If the user is not logged in, redirect to `/login`. If the user is logged in but has no houseId, redirect to `/create-join`. Otherwise render the child.

Set up React Router with routes for `/login`, `/signup`, `/create-join`, and a wildcard redirect to `/login`. All routes except login and signup must be wrapped in ProtectedRoute. All page-level components except Login and Signup must be lazy loaded.

Build a reusable Spinner component used as the Suspense fallback.

---

## Phase 2 — House System

Build the Create/Join page. This is the first screen a logged-in user without a house sees.

It has two tabs — "Create a House" and "Join with a Code".

Create tab: user enters a house name. On submit, generate a random 6-character alphanumeric invite code (avoid ambiguous characters like 0, O, I, 1), create a document in the `houses` collection with the user as the first member, and update the user's Firestore profile to store the houseId. Redirect to `/dashboard`.

Join tab: user enters a 6-digit invite code. Auto-focus this input using `useRef` when the tab is selected. On submit, query Firestore for a house with that invite code, add the user's uid to the members array, update their Firestore profile with the houseId, write an activity document saying they joined, and redirect to `/dashboard`.

Build HouseContext. It listens in real time to the house document using `onSnapshot`. It also fetches all member user profiles (one fetch per uid in the members array) and exposes house data, member profiles array, and a loading boolean. Wrap the app in HouseProvider inside AuthProvider.

Build a minimal Navbar with the house name, the logged-in user's name, and a logout button. Show this on all protected pages.

---

## Phase 3 — Expense Logging

Build the Expenses page.

Build an Add Expense form as a modal or slide-in panel. Fields: title (text), amount (number), paid by (dropdown of house members), split among (multi-select checkboxes of house members, all checked by default). On submit, calculate perPersonShare as amount divided by number of people in splitAmong. Write the expense document to Firestore. Also write an activity document saying who added what expense for how much. Close the panel after success.

Build an Expense Card component showing title, amount, who paid, and how many people it's split among. Each card has a delete button. Deleting removes the Firestore document and writes an activity entry.

Build the Expense List that fetches all expenses for the current houseId in real time using `onSnapshot`, ordered by createdAt descending. Render ExpenseCard for each. Show a loading spinner while fetching. Show an empty state message if no expenses exist.

Lift the form open/close state up to the Expenses page — the page owns whether the form is visible, and passes a handler down to a button in the page header.

---

## Phase 4 — Balance Calculator

Build the balance calculation logic inside a custom hook called `useBalances`. This hook reads the expenses list and settlements list. For every expense, for every person in splitAmong (excluding the payer), that person owes the payer perPersonShare. Aggregate all debts into net balances between pairs. Subtract any settlements from those balances. Expose the final net balance map.

Wrap this calculation in `useMemo` so it only recalculates when expenses or settlements change.

Build the Balance Summary component for the Dashboard. For each net balance, display: "You owe [Name] ₹[amount]" or "[Name] owes you ₹[amount]" from the perspective of the logged-in user. If all balances are zero, show a "You're all settled up!" message.

Build the Dashboard page with two sections: Balance Summary at the top, Activity Feed below it.

---

## Phase 5 — Settle Up

Build the Settle page.

Show a list of all non-zero balances involving the current user. For each balance where the current user owes someone, show a "Settle Up" button.

Clicking Settle Up opens a modal pre-filled with the person's name and the amount owed. The user can edit the amount. On confirm, write a document to the `settlements` collection (fromUid, toUid, amount), write an activity entry saying the settlement happened, and close the modal.

Build a Settlement History section below showing all past settlements for the house in reverse chronological order.

---

## Phase 6 — Chore Rotation

Build the Chores page.

Build an Add Chore form. Fields: chore title. On submit, create a chore document in Firestore with the rotationOrder set to the current house members array and assignedTo set to the first member in that array.

Build a Chore Board that shows all chores for the house in real time. Each chore shows the title and who it's currently assigned to, using their display name from the members list.

Each chore has a "Mark as Done" button. When clicked, it advances the assignedTo to the next person in the rotationOrder (cycling back to the start after the last person), updates the chore document, and writes an activity entry.

Each chore also has a delete button that removes it from Firestore.

---

## Phase 7 — Activity Feed

Build the Activity Feed component. It listens in real time to the `activity` collection filtered by houseId, ordered by timestamp descending, limited to the 20 most recent entries.

Render each activity as a single line: "[actorName] [message] · [relative time, e.g. 2 hours ago]".

Display this feed on the Dashboard page below the Balance Summary.

---

## Phase 8 — Polish & Final Checklist

Go through every page and ensure:
- All loading states show a spinner
- All error states show a readable error message near the relevant action
- All empty states (no expenses, no chores, no activity) show a helpful message
- The app is fully responsive — works on mobile widths (375px) and desktop widths
- The Navbar shows correctly on all protected pages
- Logout clears all state and redirects to login
- Protected routes correctly redirect unauthenticated users
- React.lazy and Suspense are confirmed working (check Network tab for code splitting)
- No console errors or warnings in production build

Run `npm run build` and confirm it compiles with no errors. Deploy to Vercel or Netlify.

---

## Final Deliverable Checklist

- [ ] GitHub repo with clean commit history (one commit per phase minimum)
- [ ] README with: problem statement, features list, tech stack, setup instructions, live link
- [ ] `.env.example` file with placeholder keys (not real keys)
- [ ] Live deployment link
- [ ] 3–5 minute demo video covering: the problem, create/join flow, adding an expense, viewing balances, settling up, chore rotation, activity feed
