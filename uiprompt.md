# RoomieFinance — Complete UI/UX Overhaul Prompt

## Important Rules
- Do NOT touch any service files, context files, hooks, or utility logic files
- Do NOT modify anything inside `/services`, `/hooks`, `/utils`, or `/context`
- Only modify JSX structure and Tailwind classes in `/components` and `/pages`
- Do not install any new packages
- All styling must use Tailwind utility classes only — no inline styles, no CSS files
- After completing all changes, run `npm run build` and confirm zero errors

---

## Design Direction

**Aesthetic:** Refined, warm minimalism. Think of a well-designed fintech app for young people — not a bank, not a startup landing page. Clean cards, generous spacing, clear hierarchy, warm neutrals that feel human.

**Feeling:** The app should feel like something you'd actually want to open. Calm, clear, trustworthy. Not sterile like enterprise software, not loud like a gaming app.

**One thing to remember:** Every balance row, every expense card, every modal should feel like it was designed for a real user who is slightly stressed about money. Clarity is kindness. Make numbers easy to read. Make actions obvious.

---

## Color System (Use These Tailwind Classes Consistently)

```
Page backgrounds:    bg-zinc-50
Card backgrounds:    bg-white
Primary accent:      indigo-600 (buttons, active states, links)
Accent hover:        indigo-700
Accent light:        indigo-50 (backgrounds), indigo-100 (chips)
Accent text:         indigo-600 (amounts, labels)

Text hierarchy:
  Headings:          text-zinc-900
  Body:              text-zinc-700
  Secondary:         text-zinc-500
  Hints/placeholders: text-zinc-400

Positive (money in):  text-emerald-600, bg-emerald-50, border-emerald-200
Negative (money out): text-rose-600, bg-rose-50, border-rose-200

Borders:             border-zinc-200
Dividers:            divide-zinc-100
Hover backgrounds:   hover:bg-zinc-50
Input backgrounds:   bg-zinc-50

Success states:      emerald-*
Error states:        rose-*
Warning/pending:     amber-*
```

---

## Typography Rules

- Page titles: `text-2xl font-bold tracking-tight text-zinc-900`
- Section headings: `text-sm font-semibold text-zinc-500 uppercase tracking-widest`
- Card titles: `text-base font-semibold text-zinc-900`
- Body text: `text-sm text-zinc-700`
- Secondary text: `text-xs text-zinc-500`
- Amounts (large): `text-xl font-bold tabular-nums`
- Amounts (medium): `text-base font-semibold tabular-nums`
- Amounts (small): `text-sm font-medium tabular-nums`
- Monospace (codes): `font-mono tracking-widest`

Always use `tabular-nums` on any number that could change (balances, amounts) so the layout doesn't shift.

---

## Component Library (Build These Reusables First)

Before touching any page, create these shared UI primitives in `/src/components/ui/`:

### `/src/components/ui/Card.jsx`
A wrapper with consistent card styling. Props: `children`, `className` (optional).
```
className: "bg-white rounded-2xl border border-zinc-200 shadow-sm"
```
Usage: wrap all content cards in this instead of repeating the classes everywhere.

### `/src/components/ui/SectionHeading.jsx`
Props: `children`.
Renders: `<h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">`

### `/src/components/ui/Avatar.jsx`
Props: `name` (string), `size` (sm/md, default md).
Renders a circle with the first letter of `name`.
- md: `w-8 h-8 text-sm`
- sm: `w-6 h-6 text-xs`
- Background: derive from name using a simple hash — cycle through these bg/text pairs based on `name.charCodeAt(0) % 5`:
  - `bg-indigo-100 text-indigo-700`
  - `bg-emerald-100 text-emerald-700`
  - `bg-amber-100 text-amber-700`
  - `bg-rose-100 text-rose-700`
  - `bg-violet-100 text-violet-700`
- Always `rounded-full flex items-center justify-center font-semibold flex-shrink-0`

### `/src/components/ui/Badge.jsx`
Props: `children`, `variant` (default/success/error/warning).
- default: `bg-zinc-100 text-zinc-600`
- success: `bg-emerald-100 text-emerald-700`
- error: `bg-rose-100 text-rose-700`
- warning: `bg-amber-100 text-amber-700`
- Base: `text-xs font-medium px-2.5 py-0.5 rounded-full`

### `/src/components/ui/EmptyState.jsx`
Props: `icon` (emoji string), `title`, `subtitle`, `action` (optional JSX).
```
<div className="flex flex-col items-center justify-center py-16 text-center">
  <span className="text-5xl mb-4">{icon}</span>
  <p className="text-base font-semibold text-zinc-700">{title}</p>
  <p className="text-sm text-zinc-400 mt-1 max-w-xs">{subtitle}</p>
  {action && <div className="mt-5">{action}</div>}
</div>
```

### `/src/components/ui/Spinner.jsx` (replace existing)
```
<div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 gap-4">
  <div className="w-8 h-8 border-[3px] border-zinc-200 border-t-indigo-600 rounded-full animate-spin" />
  <p className="text-sm text-zinc-400 font-medium">Loading…</p>
</div>
```

---

## Navbar

Replace the entire `Navbar.jsx` with this redesign:

**Structure:**
- Outer: `bg-white border-b border-zinc-200 sticky top-0 z-40`
- Inner container: `max-w-2xl mx-auto px-4 h-14 flex items-center justify-between`

**Left side:**
- House name in `text-sm font-bold text-zinc-900`
- Below or beside it (on desktop), nav links as tabs

**Nav links:**
- Container: `hidden sm:flex items-center gap-1 ml-6`
- Each NavLink base: `text-sm px-3 py-1.5 rounded-lg font-medium transition-colors`
- Inactive: `text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100`
- Active: `bg-indigo-50 text-indigo-700 font-semibold`
- Links: Dashboard, Expenses, Settle

**Right side:**
- Avatar component using the logged-in user's display name
- Clicking the avatar shows a tiny dropdown with user's name and a Logout button
- Dropdown: `absolute right-0 top-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-44 z-50`
- Dropdown item: `px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer`
- Logout item: `px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer`
- Implement with a `useState(false)` for open/close, close on outside click with a `useEffect` that adds/removes a document click listener

**Mobile hamburger:**
- Show hamburger icon on `sm:hidden`
- Full-width mobile menu drops below navbar with the same nav links stacked vertically
- Each mobile nav link: `block px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 border-b border-zinc-100`
- Active mobile link: `text-indigo-700 bg-indigo-50`

---

## Auth Pages (Login + Signup)

Replace both auth pages with this redesign:

**Page container:**
```
min-h-screen bg-gradient-to-br from-zinc-100 via-white to-indigo-50
flex items-center justify-center px-4
```

**Card:**
```
w-full max-w-sm bg-white rounded-3xl shadow-xl border border-zinc-100 p-8
```

**Header inside card:**
- App icon: a `w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-6` with a simple house emoji `🏠` in white text or `text-white text-lg`
- App name: `text-xl font-bold text-zinc-900`
- Tagline: `text-sm text-zinc-400 mt-1`
  - Login: "Welcome back. Good to see you."
  - Signup: "Create your account. It's free."

**Form fields:**
- Label: `text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block`
- Input: `w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`
- Spacing between fields: `space-y-4`

**Error banner:**
```
bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4
```

**Submit button:**
```
w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 
text-white font-semibold py-2.5 rounded-xl transition-colors 
disabled:opacity-50 disabled:cursor-not-allowed mt-2
```
Show spinner inside button when loading: replace text with a small inline spinner `w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block`

**Footer link:**
```
text-center text-sm text-zinc-500 mt-5
```
Link: `text-indigo-600 font-semibold hover:underline`

---

## Create / Join Page

**Page:** Same gradient background as auth pages.

**Card:** Same `rounded-3xl shadow-xl` card.

**Header:** 
- Icon: `🏠` in indigo circle
- Title: "Set up your house"
- Subtitle: "Create a new shared house or join one with an invite code."

**Tabs:**
- Container: `flex bg-zinc-100 rounded-xl p-1 mb-6`
- Active: `flex-1 bg-white rounded-lg py-2 text-sm font-semibold text-indigo-700 shadow-sm text-center transition-all`
- Inactive: `flex-1 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 text-center transition-colors cursor-pointer`

**Invite code input (Join tab):**
- Use a large centered input: `text-center font-mono text-2xl tracking-[0.3em] uppercase`
- Placeholder: `------`
- Extra padding: `py-3`
- This makes typing the code feel deliberate and fun

---

## Dashboard Page

Redesign `Dashboard.jsx` with this layout:

**Page:** `max-w-2xl mx-auto px-4 py-6 space-y-6`

### House Card (top)
```
bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white
```
Inside:
- Top row: house name in `text-lg font-bold` left, number of members `text-sm opacity-75` right (e.g. "3 members")
- Bottom row: 
  - Left: label "Invite Code" in `text-xs opacity-60 uppercase tracking-wide`, below it the code in `font-mono text-xl font-bold tracking-widest`
  - Right: a Copy button `bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors`
  - On copy: change button text to "Copied ✓" for 2 seconds using local state `const [copied, setCopied] = useState(false)`
- Member avatars row: show Avatar components for all members in a row `flex items-center gap-1.5 mt-4`

### Balances Section
- SectionHeading: "Balances"
- If settled: EmptyState with `✅` icon, "All settled up", "No one owes anyone anything right now."
- If not settled: use the redesigned BalanceSummary (see below)

### Activity Section
- SectionHeading: "Recent Activity"
- Card wrapper using Card component
- ActivityFeed inside

### BalanceSummary Component Redesign

Each balance row:
```
flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors
```
- Left: Avatar of the other person
- Middle: 
  - Name in `text-sm font-semibold text-zinc-900`
  - Subtext in `text-xs text-zinc-400` — "You owe them" or "They owe you"
- Right: 
  - Amount — if you owe: `text-rose-600 font-bold tabular-nums text-base` 
  - If they owe: `text-emerald-600 font-bold tabular-nums text-base`
  - Small directional indicator: `↑` in rose for you owe, `↓` in emerald for they owe

Wrap all rows in a Card with `divide-y divide-zinc-100 overflow-hidden`.

---

## Expenses Page

**Page layout:** `max-w-2xl mx-auto px-4 py-6`

**Header row:**
```
flex items-center justify-between mb-6
```
- Title: `text-2xl font-bold tracking-tight text-zinc-900`
- Add button: redesigned (see below)

**Add Expense Button:**
```
flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 
text-white text-sm font-semibold px-4 py-2.5 rounded-xl 
transition-colors shadow-sm
```
With a `+` SVG icon (a circle with a plus):
```jsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
</svg>
```

**Empty state:** EmptyState component with `🧾`, "No expenses yet", "Add the first one to start tracking."

**Expense List:** `space-y-3`

### ExpenseCard Redesign

```
bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow
```

**Layout:**
```
flex items-start gap-3
```

**Left: Category icon circle**
- A `w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0`
- Use emoji based on title keywords:
  - contains "groceries/food/lunch/dinner/restaurant": 🛒
  - contains "electricity/bill/power/internet/wifi": ⚡
  - contains "rent/flat/house": 🏠
  - contains "petrol/fuel/uber/cab/auto": 🚗
  - default: 💸

**Middle: Content**
- Title: `text-sm font-semibold text-zinc-900`
- Paid by: `text-xs text-zinc-500 mt-0.5` — "Paid by [Name]"
- Split pills row: `flex flex-wrap gap-1.5 mt-2`
  - Each person: `flex items-center gap-1 bg-zinc-100 rounded-full px-2 py-0.5`
  - Avatar (size sm) + name `text-xs text-zinc-600` + amount `text-xs font-semibold text-zinc-800 ml-0.5`

**Right: Amount + splitType**
- Amount: `text-base font-bold tabular-nums text-zinc-900`
- Split type badge: Badge component with default variant showing the splitType (Equal/Exact/%)
- These right-aligned, stacked vertically

**Delete button:**
- Appears on hover of the card — use `group` on the card and `opacity-0 group-hover:opacity-100 transition-opacity` on the button
- Position: absolute top-right `absolute top-3 right-3`
- Make the card `relative`
- Button: `p-1 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-colors`
- SVG trash icon: `w-4 h-4`

---

## AddExpenseForm Modal Redesign

**Overlay:** `fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center`

**Modal panel:**
```
w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl 
max-h-[92vh] overflow-y-auto
```

**Drag handle (mobile only):**
```
w-12 h-1 bg-zinc-300 rounded-full mx-auto mt-3 mb-1 sm:hidden
```

**Header:**
```
flex items-center justify-between px-6 py-4 border-b border-zinc-100
```
- Title: `text-lg font-bold text-zinc-900`
- Close: SVG X icon in `w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer`

**Form body:** `px-6 py-5 space-y-5`

**Field labels:** `text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5`

**Inputs:**
```
w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 
text-sm text-zinc-900 placeholder:text-zinc-400
focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
```

**Amount input:** Add a `₹` prefix inside the input container:
```
relative
  span: absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium
  input: pl-7 (extra left padding)
```

**Paid by select:** Same input styling but as a `<select>` — add a custom dropdown arrow by wrapping in a `relative` div with an SVG chevron `absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400`

**SplitEditor tabs:**
- Tab bar: `flex bg-zinc-100 rounded-xl p-1`
- Active tab: `flex-1 bg-white rounded-lg py-1.5 text-xs font-semibold text-indigo-700 shadow-sm text-center`
- Inactive: `flex-1 py-1.5 text-xs text-zinc-500 text-center cursor-pointer hover:text-zinc-700`

**Submit button:**
```
w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 
text-white font-semibold py-3 rounded-xl transition-colors mt-2
```
Full-height bottom section: `px-6 pb-6 pt-2 border-t border-zinc-100`

---

## Settle Page

**Page layout:** `max-w-2xl mx-auto px-4 py-6 space-y-8`

**Page title:** `text-2xl font-bold tracking-tight text-zinc-900 mb-6`

### Outstanding Balances

SectionHeading: "What You Owe"

If all settled: EmptyState with `🤝`, "All settled up!", "Nobody owes anyone anything. You're good."

Each balance row (you owe someone):
```
bg-white rounded-2xl border border-zinc-200 p-4 
flex items-center gap-3 shadow-sm
```
- Left: Avatar of the other person (size md)
- Middle:
  - Name: `text-sm font-semibold text-zinc-900`
  - "You owe them" in `text-xs text-zinc-400`
- Right side:
  - Amount: `text-lg font-bold text-rose-600 tabular-nums`
  - Settle Up button below it: `text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer`

Each balance row (they owe you):
- Same layout but amount in `text-emerald-600`
- No Settle Up button — instead show `text-xs text-zinc-400 mt-0.5` "Waiting for them"

### Settlement History

SectionHeading: "Past Settlements"

Empty state: `text-sm text-zinc-400 text-center py-8` — "No settlements recorded yet."

Each history row inside a Card:
```
flex items-center gap-3 px-4 py-3 border-b border-zinc-100 last:border-0
```
- Left: a `w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs flex-shrink-0` with a checkmark `✓`
- Middle:
  - `text-sm text-zinc-700` — "[Name] paid [Name]"
  - `text-xs text-zinc-400 mt-0.5` — timeAgo
- Right: `text-sm font-semibold text-emerald-600 tabular-nums` — ₹amount

### SettleModal Redesign

**Overlay:** Same as AddExpenseForm — `backdrop-blur-sm`

**Panel:** `w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl`

**Header:** Same pattern — title + close button

**Body:** `px-6 py-5`

Show who you're paying:
```
flex items-center gap-3 bg-zinc-50 rounded-xl p-3 mb-5
```
- Avatar (md) of the payee
- Name: `text-sm font-semibold text-zinc-900`
- Amount owed: `text-sm text-rose-600 font-medium` — "You owe ₹X"

Amount input with `₹` prefix (same as expense form).

"Max: ₹X" hint below input in `text-xs text-zinc-400 mt-1`.

Cap error: `text-xs text-rose-500 mt-1`.

Buttons row:
- Cancel: `flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-2.5 rounded-xl text-sm transition-colors`
- Confirm: `flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50`

---

## Activity Feed Redesign

Replace the `<ul>` with styled rows:

Each item:
```
flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0
```

Left: Avatar component (size sm) using `actorName`

Right:
```
flex-1 min-w-0
```
- First line: `text-sm text-zinc-700` — `<span className="font-semibold text-zinc-900">{actorName}</span> {message}`
- Second line: `text-xs text-zinc-400 mt-0.5` — timeAgo

**Loading state:** Show 3 skeleton rows:
```
animate-pulse flex items-start gap-3 py-3
  div: w-6 h-6 rounded-full bg-zinc-200
  div: flex-1 space-y-1.5
    div: h-3 bg-zinc-100 rounded w-3/4
    div: h-2.5 bg-zinc-100 rounded w-1/3
```

---

## Micro-interactions & Polish

Apply these small details across the entire app:

**Button press states:** Add `active:scale-[0.97] transition-transform` to all primary buttons.

**Card hover:** Add `hover:shadow-md transition-shadow duration-200` to all clickable cards.

**Input focus transition:** All inputs should have `transition-all duration-150` so the focus ring appears smoothly.

**Number formatting:** Every rupee amount must use `toLocaleString('en-IN')` for proper Indian number formatting. Replace all `.toFixed(2)` on display amounts with:
```js
const formatRupee = (amount) => 
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
```
Add this to `formatTime.js` and import it wherever amounts are displayed.

**Copy button feedback:** On the invite code copy button, use:
```js
navigator.clipboard.writeText(house.inviteCode)
  .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
```

**Page transitions:** On every main page's outer `<main>`, add:
```
className="... animate-in fade-in duration-200"
```
Tailwind v4 supports `animate-in` — if not available, add a custom CSS class:
```css
/* In index.css, after @import tailwindcss */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: fade-in 0.2s ease-out;
}
```
Then use `className="... page-enter"` on each page's outer container.

---

## index.html

Update the title:
```html
<title>RoomieFinance — Split fairly. Live peacefully.</title>
```

---

## Final Checklist

After all changes:

- [ ] All `bg-gray-*` replaced with `bg-zinc-*`
- [ ] All `text-gray-*` replaced with `text-zinc-*`
- [ ] All `border-gray-*` replaced with `border-zinc-*`
- [ ] Avatar component used on: Navbar, BalanceSummary, Settle page, Activity Feed
- [ ] EmptyState component used on: Expenses, Settle, Activity Feed
- [ ] Card component used on: all content areas
- [ ] SectionHeading used on: all section titles
- [ ] All modals have backdrop-blur-sm
- [ ] All modals have drag handle on mobile
- [ ] Copy button works and shows "Copied ✓" feedback
- [ ] formatRupee function used on all displayed amounts
- [ ] Page enter animation applied to all protected pages
- [ ] `npm run build` passes with zero errors
- [ ] Test on 375px mobile width — all pages usable
- [ ] Test on 1280px desktop — all pages centered and well-spaced