let transactions = [];
let monthlyIncome = 0;
let spendingLimit = 0;
let savingsGoal = 0;
let userName = "";
let expenseChart;

// High-contrast chart colors for dark & light mode
const chartColors = [
  "#4CAF50", // green
  "#FF5733", // reddish-orange
  "#3498DB", // blue
  "#F1C40F", // yellow
  "#9B59B6", // purple
  "#E67E22", // orange
  "#1ABC9C"  // teal
];

// Load data and initialize
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  updateUI();
});

// ================= SET MONTHLY DETAILS =================
document.getElementById("setIncomeBtn").onclick = function() {
  monthlyIncome = parseFloat(incomeInput.value) || 0;
  spendingLimit = parseFloat(limitInput.value) || 0;
  savingsGoal = parseFloat(goalInput.value) || 0;
  userName = nameInput.value || "User";
  saveData();
  updateUI();
};

// ================= ADD EXPENSE =================
document.getElementById("addExpenseBtn").onclick = function() {
  const amount = parseFloat(expenseAmount.value);
  const desc = expenseDesc.value;
  const cat = categorySelect.value;

  if (!amount || amount <= 0) return;

  transactions.push({
    id: Date.now(),
    amount,
    desc,
    cat,
    date: new Date().toLocaleDateString()
  });

  saveData();
  updateUI();
};

// ================= UPDATE UI =================
function updateUI() {
  const totalExpenses = transactions.reduce((sum,t)=>sum+t.amount,0);
  const balance = monthlyIncome - totalExpenses;

  animate("balanceDisplay", balance);
  animate("expenseDisplay", totalExpenses);
  animate("savingsDisplay", balance);

  greeting.innerText = `Hello, ${userName} 👋`;

  updateProgress(totalExpenses);
  updateWarning(totalExpenses);
  renderTable();
  renderChart();
}

function animate(id,value){
  document.getElementById(id).innerText="₹"+value.toFixed(2);
}

// ================= PROGRESS BAR =================
function updateProgress(exp){
  let percent = spendingLimit ? (exp/spendingLimit)*100 : 0;
  progressBar.style.width = Math.min(percent,100) + "%";
}

// ================= WARNING =================
function updateWarning(exp){
  if(exp > spendingLimit && spendingLimit > 0){
    warningBox.style.display="block";
    warningBox.innerText="⚠ Spending Limit Exceeded!";
  } else {
    warningBox.style.display="none";
  }
}

// ================= TRANSACTION TABLE =================
function renderTable(){
  transactionTable.innerHTML = "";
  transactions.forEach(t=>{
    transactionTable.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.desc}</td>
        <td>${t.cat}</td>
        <td>₹${t.amount}</td>
        <td><button onclick="deleteTxn(${t.id})">X</button></td>
      </tr>
    `;
  });
}

function deleteTxn(id){
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

// ================= PIE/DOUGHNUT CHART =================
function renderChart(){
  const ctx = document.getElementById("expenseChart").getContext("2d");

  const cats = {};
  transactions.forEach(t => {
    cats[t.cat] = (cats[t.cat] || 0) + t.amount;
  });

  if(expenseChart) expenseChart.destroy();

  // Check if there are any transactions
  const hasData = Object.keys(cats).length > 0;

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: hasData ? Object.keys(cats) : ["No Expenses"],
      datasets: [{
        data: hasData ? Object.values(cats) : [1], // single slice
        backgroundColor: hasData 
          ? chartColors.slice(0, Object.keys(cats).length) 
          : [document.body.classList.contains('light') ? '#9CA3AF' : '#6B7280'], // gray slice
        borderColor: "#fff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('light') ? '#111' : '#fff',
            font: { size: 12, weight: '500' }
          }
        }
      }
    },
    plugins: [{
  id: 'noExpensesText',
  beforeDraw(chart) {
    if (!hasData) {
      const {ctx, width, height} = chart;
      ctx.save();
      ctx.font = '16px Poppins';
      ctx.fillStyle = document.body.classList.contains('light') ? '#6B7280' : '#D1D5DB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Expenses Yet', width / 2, height / 2);
      ctx.restore();
    }
  }
}]

  });
}

// ================= EXPORT CSV =================
document.getElementById("exportCSV").onclick = function(){
  let csv = "Date,Description,Category,Amount\n";
  transactions.forEach(t=>{
    csv += `${t.date},${t.desc},${t.cat},${t.amount}\n`;
  });
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
};

// ================= RESET MONTH =================
document.getElementById("resetMonthBtn").onclick = function(){
  localStorage.setItem("lastMonth", transactions.reduce((s,t)=>s+t.amount,0));
  transactions = [];
  saveData();
  updateUI();
};

// ================= SAVE / LOAD DATA =================
function saveData(){
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("income", monthlyIncome);
  localStorage.setItem("limit", spendingLimit);
  localStorage.setItem("goal", savingsGoal);
  localStorage.setItem("name", userName);
}

function loadData(){
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  monthlyIncome = parseFloat(localStorage.getItem("income")) || 0;
  spendingLimit = parseFloat(localStorage.getItem("limit")) || 0;
  savingsGoal = parseFloat(localStorage.getItem("goal")) || 0;
  userName = localStorage.getItem("name") || "User";
}

// ================= THEME TOGGLE =================
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  toggleBtn.addEventListener("click", function () {
    document.body.classList.toggle("light");

    // update icon
    themeIcon.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";

    // update chart legend colors dynamically
    if(expenseChart){
      expenseChart.options.plugins.legend.labels.color = document.body.classList.contains('light') ? '#111' : '#fff';
      expenseChart.update();
    }
  });
});
