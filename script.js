// Data storage
let users = [];
let expenses = [];

// Load data on page load
function loadData() {
    // Keep app state fresh on every new run of Live Server.
    users = [];
    expenses = [];

    try {
        localStorage.removeItem('splitExpenseUsers');
        localStorage.removeItem('splitExpenseExpenses');
    } catch (err) {
        console.error('Failed to clear saved data from localStorage:', err);
    }

    renderUsers();
    renderExpenses();
    renderBalances();
}

// Save data (disabled: this app now starts fresh each time)
function saveData() {
    // Intentionally no-op.
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add User
function addUser() {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a user name');
        return;
    }
    
    const user = {
        id: generateId(),
        name: name
    };
    
    users.push(user);
    saveData();
    renderUsers();
    nameInput.value = '';
}

// Render Users
function renderUsers() {
    const userList = document.getElementById('userList');
    const paidBySelect = document.getElementById('paidBy');
    const participantsList = document.getElementById('participantsList');
    
    // Display users list (guard DOM elements)
    if (userList) {
        userList.innerHTML = users.map(user => 
            `<div class="list-item">${user.name}</div>`
        ).join('');
    }

    // Update paid by dropdown
    if (paidBySelect) {
        paidBySelect.innerHTML = '<option value="">Select who paid</option>' + 
            users.map(user => `<option value="${user.id}">${user.name}</option>`).join('');
    }

    // Update participants checkboxes
    if (participantsList) {
        participantsList.innerHTML = users.map(user => 
            `<div class="checkbox-item">
                <input type="checkbox" id="participant_${user.id}" value="${user.id}">
                <label for="participant_${user.id}">${user.name}</label>
            </div>`
        ).join('');
    }

    // Reset Select All button text when users list updates
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) selectAllBtn.textContent = 'Select All';
}

// Toggle Select All / Deselect All Participants
function selectAllParticipants() {
    const checkboxes = Array.from(document.querySelectorAll('#participantsList input[type="checkbox"]'));
    if (checkboxes.length === 0) return;

    const allChecked = checkboxes.every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);

    const btn = document.getElementById('selectAllBtn');
    if (btn) btn.textContent = allChecked ? 'Select All' : 'Deselect All';
}

// Add Expense
function addExpense() {
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const paidBy = document.getElementById('paidBy').value;
    
    // Get selected participants
    const participantCheckboxes = document.querySelectorAll('#participantsList input[type="checkbox"]:checked');
    const participants = Array.from(participantCheckboxes).map(cb => cb.value);
    
    if (!desc) {
        alert('Please enter expense description');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!paidBy) {
        alert('Please select who paid');
        return;
    }
    
    if (participants.length === 0) {
        alert('Please select at least one participant');
        return;
    }
    
    const expense = {
        id: generateId(),
        description: desc,
        totalAmount: amount,
        paidBy: paidBy,
        participants: participants
    };
    
    expenses.push(expense);
    saveData();
    renderExpenses();
    renderBalances();
    
    // Clear form
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('paidBy').value = '';
    document.querySelectorAll('#participantsList input[type="checkbox"]').forEach(cb => cb.checked = false);
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) selectAllBtn.textContent = 'Select All';
}

// Render Expenses
function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    
    if (expenses.length === 0) {
        expenseList.innerHTML = '<p>No expenses added yet</p>';
        return;
    }
    
    expenseList.innerHTML = expenses.map(expense => {
        const payer = users.find(u => u.id === expense.paidBy);
        return `<div class="list-item">
            <strong>${expense.description}</strong><br>
            Amount: ₹${expense.totalAmount}<br>
            Paid by: ${payer ? payer.name : 'Unknown'}
        </div>`;
    }).join('');
}

// Calculate and Render Balances
function renderBalances() {
    const balanceList = document.getElementById('balanceList');
    
    if (expenses.length === 0) {
        balanceList.innerHTML = '<p>No expenses to calculate</p>';
        return;
    }
    
    // Calculate net balance for each user
    let netBalances = {};
    
    // Initialize all users with 0 balance
    users.forEach(user => {
        netBalances[user.id] = 0;
    });
    
    // Process each expense
    expenses.forEach(expense => {
        const payerId = expense.paidBy;
        const splitAmount = expense.totalAmount / expense.participants.length;
        
        // Payer gets credit for full amount
        netBalances[payerId] += expense.totalAmount;
        
        // Each participant owes their share
        expense.participants.forEach(participantId => {
            netBalances[participantId] -= splitAmount;
        });
    });
    
    // Calculate who owes whom
    let debtors = [];
    let creditors = [];
    
    Object.keys(netBalances).forEach(userId => {
        const balance = netBalances[userId];
        if (balance < -0.01) {
            debtors.push({ userId, amount: Math.abs(balance) });
        } else if (balance > 0.01) {
            creditors.push({ userId, amount: balance });
        }
    });
    
    // Sort for optimal matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    // Calculate settlements
    let settlements = [];
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const amount = Math.min(debtor.amount, creditor.amount);
        
        if (amount > 0.01) {
            const debtorUser = users.find(u => u.id === debtor.userId);
            const creditorUser = users.find(u => u.id === creditor.userId);
            
            settlements.push({
                from: debtorUser.name,
                to: creditorUser.name,
                amount: amount.toFixed(2)
            });
        }
        
        debtor.amount -= amount;
        creditor.amount -= amount;
        
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }
    
    // Display settlements
    if (settlements.length === 0) {
        balanceList.innerHTML = '<p>All settled up!</p>';
    } else {
        balanceList.innerHTML = settlements.map(s => 
            `<div class="balance-item">${s.from} owes ${s.to} ₹${s.amount}</div>`
        ).join('');
    }
}

// Initialize app on DOM ready to avoid missing elements or race conditions
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}
