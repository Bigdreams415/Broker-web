// app.js
//portfolio and holding code

document.addEventListener('DOMContentLoaded', function () {
    // Fetch portfolio data
    fetchPortfolioData();
});

// Function to fetch portfolio data from the backend
function fetchPortfolioData() {
    fetch('http://localhost:3000/portfolio', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            updatePortfolioUI(data); // Update UI with portfolio data
        }
    })
    .catch(error => {
        console.error('Error fetching portfolio data:', error);
    });
}

// Function to update UI with portfolio data
function updatePortfolioUI(data) {
    // Update Total Balance
    document.getElementById('total-balance').textContent = `$${data.totalBalance.toFixed(2)}`;

    // Update Holdings
    const holdingsContainer = document.querySelector(".holdings");
    holdingsContainer.innerHTML = "";  // Clear existing holdings list

    data.holdings.forEach(holding => {
        const holdingElement = document.createElement("div");
        holdingElement.classList.add("holding");
        holdingElement.innerHTML = `
            <h4>${holding.name} (${holding.symbol})</h4>
            <p>Amount: $${holding.amount}</p>
            <p>Value: ${holding.value.toFixed(2)}</p>
        `;
        holdingsContainer.appendChild(holdingElement);
    });
}


// Handle Sidebar Navigation Active State
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelector('.sidebar a.active').classList.remove('active');
        this.classList.add('active');
    });
});

 
// Fetch Market Data Functionality
async function fetchMarketData() {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false';

    try {
        const response = await fetch(url);
        const data = await response.json();

        const marketList = document.getElementById('market-list');
        marketList.innerHTML = ''; // Clear any existing data

        data.forEach(coin => {
            const marketItem = document.createElement('div');
            marketItem.classList.add('market-item');
            marketItem.innerHTML = `
                <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
                <p>Price: $${coin.current_price}</p>
                <button onclick="openTradeModal('${coin.id}', 'buy')">Buy</button>
                <button onclick="openTradeModal('${coin.id}', 'sell')">Sell</button>
            `;
            marketList.appendChild(marketItem);
        });
    } catch (error) {
        console.error("Error fetching market data:", error);
    }
}

// Call the function to fetch market data when the page loads
fetchMarketData();

// Sidebar Navigation Functions


// Function to show the Portfolio section
function showPortfolio() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById('portfolio').style.display = 'block'; // Show Portfolio
}

// Function to show the Market section
function showMarket() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById('market-data').style.display = 'block'; // Show Market Data
}

// Function to show the Trade section
function showTrade() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById('trade').style.display = 'block'; // Show Trade
}

// Function to show the Transactions section
function showTransactions() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById('transactions').style.display = 'block'; // Show Transactions
}


function showSettings() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById('settings').style.display = 'block'; // Show Settings
}

 
// Attach the functions to the sidebar menu items
document.getElementById('portfolio-menu').addEventListener('click', showPortfolio);
document.getElementById('market-menu').addEventListener('click', showMarket);
document.getElementById('trading-menu').addEventListener('click', showTrade);
document.getElementById('transaction-menu').addEventListener('click', showTransactions);
document.getElementById('settings-menu').addEventListener('click', showSettings);
document.getElementById('settings-menu').addEventListener('click', showSettings);

// Initialize the default section
showPortfolio();

// Open Trade Modal
function openTradeModal(assetName, action) {
    document.getElementById('modalAssetName').textContent = assetName;
    document.getElementById('investmentModal').style.display = 'block';

    // Add event listener for investment confirmation
    document.querySelector('.modal-close').onclick = function() {
        document.getElementById('investmentModal').style.display = 'none';
    };

    document.querySelector('.invest-btn').onclick = function() {
        const amount = document.getElementById('investmentAmount').value;
        alert(`You are about to ${action} ${amount} of ${assetName}.`);
        document.getElementById('investmentModal').style.display = 'none';
    };
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target === document.getElementById('investmentModal')) {
        document.getElementById('investmentModal').style.display = 'none';
    }
};

// JavaScript to manage the trade modal

// Get modal and other elements
const investmentModal = document.getElementById("investmentModal");
const modalAssetName = document.getElementById("modalAssetName");
const modalClose = document.querySelector(".modal-close");

// Function to open modal
function openInvestmentModal(assetName) {
    investmentModal.style.display = "block";
    modalAssetName.textContent = assetName;
}

// Function to close modal
function closeInvestmentModal() {
    investmentModal.style.display = "none";
}

// Event listener for "Invest" buttons
document.querySelectorAll(".invest-btn").forEach(button => {
    button.addEventListener("click", function() {
        const assetName = this.parentElement.dataset.asset;
        openInvestmentModal(assetName);
    });
});

// Event listener for close button
modalClose.addEventListener("click", closeInvestmentModal);

// Close modal when clicking outside of it
window.addEventListener("click", function(event) {
    if (event.target === investmentModal) {
        closeInvestmentModal();
    }
});


// Sample transaction data (you could replace this with data from an API)
const transactions = [
    { id: 1, date: "2024-10-30", type: "Deposit", amount: 500, status: "Completed" },
    { id: 2, date: "2024-10-29", type: "Withdraw", amount: 200, status: "Completed" },
    { id: 3, date: "2024-10-28", type: "Trade", amount: 300, status: "Pending" },
    { id: 4, date: "2024-10-27", type: "Deposit", amount: 700, status: "Completed" },
    { id: 5, date: "2024-10-26", type: "Withdraw", amount: 150, status: "Completed" },
    { id: 6, date: "2024-10-25", type: "Trade", amount: 400, status: "Completed" },
    // Add more transactions for testing
];

let currentPage = 1;
const rowsPerPage = 3;

// Function to display transactions in the table
function displayTransactions(page) {
    const transactionTableBody = document.querySelector(".transaction-table tbody");
    transactionTableBody.innerHTML = ""; // Clear existing rows

    // Calculate start and end index for current page
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    paginatedTransactions.forEach(transaction => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>$${transaction.amount}</td>
            <td>${transaction.status}</td>
            <td><button class="details-btn" onclick="showTransactionDetails(${transaction.id})">Details</button></td>
        `;
        transactionTableBody.appendChild(row);
    });

    updatePagination();
}

// Function to update pagination
function updatePagination() {
    const totalPages = Math.ceil(transactions.length / rowsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = ""; // Clear existing pagination

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.classList.add("page-btn");
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayTransactions(currentPage);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.classList.add("page-btn");
        pageButton.disabled = currentPage === i;
        pageButton.onclick = () => {
            currentPage = i;
            displayTransactions(currentPage);
        };
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.classList.add("page-btn");
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayTransactions(currentPage);
        }
    };
    paginationContainer.appendChild(nextButton);

    // Show message if no transactions
    const noTransactionsMessage = document.getElementById("no-transactions");
    noTransactionsMessage.style.display = transactions.length ? "none" : "block";
}

// Function to show transaction details (placeholder for modal)
function showTransactionDetails(id) {
    const transaction = transactions.find(t => t.id === id);
    
    Swal.fire({
        title: `Transaction ID: ${id}`,
        html: `
            <p><strong>Type:</strong> ${transaction.type}</p>
            <p><strong>Amount:</strong> $${transaction.amount}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    displayTransactions(currentPage);
});



// Integrating Sweet alert2 into some existing features

// document.querySelector(".deposit-btn").addEventListener("click", () => {
//     Swal.fire({
//       title: 'Coming Soon!',
//       text: 'Deposit feature coming soon!',
//       icon: 'info',
//       confirmButtonText: 'Okay'
//     });
// });
  
document.querySelector(".withdraw-btn").addEventListener("click", () => {
    Swal.fire({
      title: 'Coming Soon!',
      text: 'Withdraw feature coming soon!',
      icon: 'info',
      confirmButtonText: 'Okay'
    });
});
  

// Update Modal with asset-specific image and custom title
function showInvestmentModal(assetName) {
    document.getElementById('modalAssetName').textContent = assetName;

    const assetImage = document.getElementById('assetImage');
    switch (assetName) {
        case 'Gold':
            assetImage.src = 'path/to/gold-icon.png';
            break;
        case 'Silver':
            assetImage.src = 'path/to/silver-icon.png';
            break;
        case 'Platinum':
            assetImage.src = 'path/to/platinum-icon.png';
            break;
        case 'Bitcoin (BTC)':
            assetImage.src = 'path/to/bitcoin-icon.png';
            break;
        case 'Ethereum (ETH)':
            assetImage.src = 'path/to/ethereum-icon.png';
            break;
        case 'Real Estate Fund':
            assetImage.src = 'path/to/real-estate-icon.png';
            break;
    }

    document.getElementById('investmentModal').style.display = 'flex';
}


// Function to update progress bar based on scroll
// function updateProgressBar() {
//     const tradeSection = document.getElementById("trade");
//     const progressBar = document.getElementById("scrollProgress");

//     const scrollTop = tradeSection.scrollTop;
//     const scrollHeight = tradeSection.scrollHeight - tradeSection.clientHeight;
//     const scrollPercentage = (scrollTop / scrollHeight) * 100;

//     progressBar.style.width = scrollPercentage + "%";
// }

// // Attach scroll event listener to the trade section
// const tradeSection = document.getElementById("trade");
// tradeSection.addEventListener("scroll", updateProgressBar);


// Select the content area and create a scroll indicator
const contentSection = document.querySelector('.content-section');
const scrollIndicator = document.createElement('div');
scrollIndicator.classList.add('scroll-indicator');
document.body.appendChild(scrollIndicator);

// Update the scroll indicator on scroll
contentSection.addEventListener('scroll', () => {
    const scrollHeight = contentSection.scrollHeight - contentSection.clientHeight;
    const scrolled = (contentSection.scrollTop / scrollHeight) * 100;
    scrollIndicator.style.width = `${scrolled}%`;
});


//Deposit modal Js code

document.addEventListener('DOMContentLoaded', function() {
    const depositBtn = document.querySelector('.deposit-btn');
    const depositModal = document.querySelector('.deposit-modal');
    let depositMethodsData = [];

    if (depositBtn) {
        depositBtn.addEventListener('click', function() {
            fetch('http://localhost:3000/admin/deposit', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                depositMethodsData = data;
                displayMethodDetails('bank-transfer');
                depositModal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error fetching deposit methods:', error);
            });
        });
    }

    document.querySelector('.close-deposit').addEventListener('click', function() {
        depositModal.style.display = 'none';
    });

    const methodMap = {
        'bank-transfer': 'Bank Transfer',
        'credit-card': 'Credit/Debit Card',
        'crypto': 'Cryptocurrency',
        'digital-wallet': 'Digital Wallet'
    };

    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = "none");
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const methodType = tab.getAttribute('data-tab');
            displayMethodDetails(methodType);
        });
    });

    function displayMethodDetails(methodType) {
        const methodName = methodMap[methodType];
        const method = depositMethodsData.find(m => m.method === methodName);
        const contentDiv = document.getElementById(methodType);

        if (method) {
            const detailsHtml = method.details.split('\n').map(line => {
                const [key, value] = line.split(':');
                if (value) {
                    return `
                        <div class="detail-item">
                            <span class="detail-key">${key.trim()}:</span>
                            <span class="detail-value">${value.trim()}</span>
                            <i class="fa-regular fa-copy copy-icon" data-copy="${value.trim()}"></i>
                        </div>
                    `;
                } else {
                    return `<p>${line}</p>`;
                }
            }).join('');

            contentDiv.innerHTML = `<h3>${method.method}</h3>${detailsHtml}`;

            document.querySelectorAll('.copy-icon').forEach(icon => {
                icon.addEventListener('click', function() {
                    const textToCopy = icon.getAttribute('data-copy');
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Copied!',
                            text: 'Item copied to clipboard.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    });
                });
            });
        } else {
            console.error(`No data found for method: ${methodType}`);
            contentDiv.innerHTML = `<p>Error loading details for ${methodType}.</p>`;
        }

        contentDiv.style.display = "block";
        contentDiv.classList.add('active');
    }
});


// Assuming `userData` is the object with user details fetched from the backend
 

document.addEventListener('DOMContentLoaded', function() {
    // Fetch user data when the page loads
    fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error('Error with response:', response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // Parse response as plain text first
    })
    .then(text => {
        try {
            const data = JSON.parse(text); // Try parsing the text into JSON
            console.log('User data received:', data);
            document.getElementById('username').textContent = data.username;
            document.getElementById('userUid').textContent = data.uid;
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
});



 