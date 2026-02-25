# Split Expense App

A simple mini web app to split group expenses and calculate who owes whom.

## Features

- Add multiple users
- Add expenses with:
  - description
  - total amount
  - payer
  - participants (`Split Between`)
- `Select All / Deselect All` toggle for participants
- View all added expenses
- Auto-calculate balance summary (who owes whom)
- Form resets after adding an expense

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

## Project Structure

- `index.html` - UI structure
- `style.css` - Styling
- `script.js` - App logic (users, expenses, split calculation)
- `todo.md` - Project checklist

## How to Run

1. Open this project folder in VS Code.
2. Start with Live Server (or any static local server).
3. Open `index.html` in browser.

## How to Use

1. Add users from **Add Users** section.
2. In **Add Expense**:
   - enter description and amount
   - choose payer
   - select participants (or click `Select All`)
3. Click **Add Expense**.
4. Check:
   - **All Expenses** for added entries
   - **Balance Summary** for settlements

## Current Data Behavior

- The app is currently configured to start fresh on every page reload / Live Server reopen.
- Saved local data is cleared on load.

## Example

If A pays 900 for A, B, C (equal split):
- each share = 300
- B owes A 300
- C owes A 300

## Future Improvements

- Optional persistent storage mode (keep data after reload)
- Edit/delete users and expenses
- Input validation enhancements
- Better currency formatting and encoding cleanup
