
document.addEventListener('DOMContentLoaded', function () {
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

  const expenseForm = document.getElementById('expense-form');
  const expenseName = document.getElementById('expense-name');
  const expenseAmount = document.getElementById('expense-amount');
  const expenseCategory = document.getElementById('expense-category');
  const expenseDate = document.getElementById('expense-date');
  const expensesList = document.getElementById('expenses-list');
  const totalAmountElement = document.getElementById('total-amount');
  const topCategoryElement = document.getElementById('top-category');
  const filterCategory = document.getElementById('filter-category');
  const filterMonth = document.getElementById('filter-month');

  expenseDate.valueAsDate = new Date();

  const ctx = document.getElementById('expense-chart').getContext('2d');
  let expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#fdcb6e', '#0984e3'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });

  expenseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const expense = {
      id: Date.now(),
      name: expenseName.value.trim(),
      amount: parseFloat(expenseAmount.value),
      category: expenseCategory.value,
      date: expenseDate.value
    };

    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    updateSummary();
    updateChart();

    expenseForm.reset();
    expenseDate.valueAsDate = new Date();
  });

  function renderExpenses() {
    const categoryFilter = filterCategory.value;
    const monthFilter = filterMonth.value;

    let filteredExpenses = expenses;

    if (categoryFilter !== 'all') {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
    }

    if (monthFilter !== 'all') {
      filteredExpenses = filteredExpenses.filter(exp => {
        const expenseDate = new Date(exp.date);
        return expenseDate.getMonth() === parseInt(monthFilter);
      });
    }

    expensesList.innerHTML = '';

    filteredExpenses.forEach(exp => {
      const expenseDate = new Date(exp.date);
      const formattedDate = expenseDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${exp.name}</td>
        <td>${exp.category}</td>
        <td>₹${exp.amount.toFixed(2)}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${exp.id}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-btn" data-id="${exp.id}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      expensesList.appendChild(row);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        deleteExpense(id);
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        editExpense(id);
      });
    });
  }

  function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
      expenses = expenses.filter(exp => exp.id !== id);
      saveExpenses();
      renderExpenses();
      updateSummary();
      updateChart();
    }
  }

  function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    expenseName.value = expense.name;
    expenseAmount.value = expense.amount;
    expenseCategory.value = expense.category;
    expenseDate.value = expense.date;

    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
  }

  function updateSummary() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalAmountElement.textContent = `₹${total.toFixed(2)}`;

    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    let topCategory = '-';
    let max = 0;
    for (const cat in categoryTotals) {
      if (categoryTotals[cat] > max) {
        max = categoryTotals[cat];
        topCategory = cat;
      }
    }

    topCategoryElement.textContent = topCategory;
  }

  function updateChart() {
    const categoryData = {};
    expenses.forEach(exp => {
      categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
    });

    expenseChart.data.labels = Object.keys(categoryData);
    expenseChart.data.datasets[0].data = Object.values(categoryData);
    expenseChart.update();
  }

  function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  filterCategory.addEventListener('change', renderExpenses);
  filterMonth.addEventListener('change', renderExpenses);

  renderExpenses();
  updateSummary();
  updateChart();
});

