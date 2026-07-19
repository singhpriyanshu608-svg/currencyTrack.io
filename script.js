import { loadChart } from "./utiles/chart.js";

// QUERY SELECTORS
const converter = document.querySelector(".converter");
const sendCurrencyButton = document.querySelector(".send-box .currency-select");
const receiveCurrencyButton = document.querySelector(".receive-box .currency-select");
const currencyList = document.querySelector(".currency-list");
const sendAmountInput = document.querySelector("#send-amount");
const receiveAmountInput = document.querySelector("#receive-amount");
const currencyDropdown = document.querySelector(".currency-dropdown");
const swapButton = document.querySelector(".swap");
const searchInput = document.querySelector(".currency-search");
const fromFoot = document.querySelector(".fromFoot");
const rateValue = document.querySelector(".rateValue");
const toFoot = document.querySelector(".toFoot");
const dateBtns = document.querySelectorAll(".range-btn");
const tab = document.querySelectorAll(".tab");
const favPanel = document.querySelector(".favorites-panel");
const histPanel = document.querySelector(".history-panel");
const logPanel = document.querySelector(".log-panel");
const comPanel = document.querySelector(".compare-panel");
const panels = document.querySelectorAll(".panel");
const favBtn = document.querySelector(".favourites-btn");
const favlist = document.querySelector(".favorites-list");
const emptyState = document.getElementById("favoritesEmpty");
const favBadge = document.querySelector("#favoritesBadge");

const tickerPairs = [
  { from: "EUR", to: "USD" },
  { from: "USD", to: "JPY" },
  { from: "GBP", to: "USD" },
  { from: "USD", to: "INR" },
  { from: "AUD", to: "USD" },
  { from: "USD", to: "CAD" },
  { from: "USD", to: "CHF" },
  { from: "NZD", to: "USD" },
  { from: "EUR", to: "GBP" },
  { from: "USD", to: "CNY" },
  { from: "EUR", to: "JPY" },
  { from: "GBP", to: "JPY" },
  { from: "USD", to: "SGD" },
  { from: "USD", to: "ZAR" },
];

let counter = 0;
const favCurr = new Map();

let chart;
let selectedRange = 30;
let currencies = [];
const today = new Date();
let sendCurrency = currencies[0];
let receiveCurrency = currencies[1];
let currentSelection = null;

// EVENT LISTENERS

favBtn.addEventListener("click", () => {
  savingFav();
});

sendCurrencyButton.addEventListener("click", (e) => {
  currentSelection = "send";
  openCurrencyDropdown(e);
});
receiveCurrencyButton.addEventListener("click", (e) => {
  currentSelection = "receive";
  openCurrencyDropdown(e);
});

document.addEventListener("click", closeDropdownOnOutsideClick);
swapButton.addEventListener("click", swapCurrency);
sendAmountInput.addEventListener("input", () => {
  convertCurrency();
});
searchInput.addEventListener("input", searchCurrency);

// LOOPS

dateBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    dateBtns.forEach((b) => b.classList.remove("range-btn--active"));
    btn.classList.add("range-btn--active");
    const range = Number(btn.dataset.range);
    selectedRange = range;
    loadChart(today, sendCurrency, receiveCurrency, selectedRange);
  });
});

tab.forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    tab.forEach((x) => x.classList.remove("tab--active"));

    if (tabBtn.dataset.panel === "favorites") {
      panels.forEach((panel) => panel.classList.remove("active"));
      favPanel.classList.add("active");
    }
    if (tabBtn.dataset.panel === "history") {
      panels.forEach((panel) => panel.classList.remove("active"));
      histPanel.classList.add("active");
    }
    if (tabBtn.dataset.panel === "log") {
      panels.forEach((panel) => panel.classList.remove("active"));
      logPanel.classList.add("active");
    }
    if (tabBtn.dataset.panel === "compare") {
      panels.forEach((panel) => panel.classList.remove("active"));
      comPanel.classList.add("active");
    }

    tabBtn.classList.add("tab--active");
  });
});

// FUNCTIONS

function openCurrencyDropdown(event) {
  event.stopPropagation();
  currencyDropdown.classList.remove("hidden");
  renderCurrencyList();
}

function closeCurrencyDropdown() {
  currencyDropdown.classList.add("hidden");
}

function closeDropdownOnOutsideClick(event) {
  if (
    !currencyDropdown.contains(event.target) &&
    !event.target.closest(".currency-select")
  ) {
    closeCurrencyDropdown();
  }
}

function updateCurrency(button, currency) {
  button.querySelector("span").textContent = currency.code;
  button.querySelector("p").textContent = currency.flag;
}

function renderCurrencyList(list = currencies) {
  currencyList.innerHTML = "";

  list.forEach((currency) => {
    const listItem = document.createElement("li");
    listItem.className = "currency-item";
    listItem.innerHTML = `
      <span>${currency.flag}</span>
      <span>${currency.code}</span>
      <span>${currency.name}</span>
    `;
    currencyList.appendChild(listItem);

    listItem.addEventListener("click", () => {
      if (currentSelection == "send") {
        sendCurrency = currency;
        updateCurrency(sendCurrencyButton, currency);
      } else {
        receiveCurrency = currency;
        updateCurrency(receiveCurrencyButton, currency);
      }
      convertCurrency();
      loadChart(today, sendCurrency, receiveCurrency, selectedRange);
      closeCurrencyDropdown();
    });
  });
}

function swapCurrency() {
  [sendCurrency, receiveCurrency] = [receiveCurrency, sendCurrency];
  updateCurrency(sendCurrencyButton, sendCurrency);
  updateCurrency(receiveCurrencyButton, receiveCurrency);

  [sendAmountInput.value, receiveAmountInput.value] = [
    receiveAmountInput.value,
    sendAmountInput.value,
  ];
  convertCurrency();
  loadChart(today, sendCurrency, receiveCurrency, selectedRange);
}

async function convertCurrency() {
  const from = sendCurrency.code;
  const to = receiveCurrency.code;
  const amount = Number(sendAmountInput.value);
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`,
    );
    const data = await response.json();
    const rate = data.rates[to];
    receiveAmountInput.value = (amount * rate).toFixed(2);
    receiveAmountInput.disabled = true;
    fromFoot.textContent = sendCurrency.code;
    toFoot.textContent = receiveCurrency.code;
    rateValue.textContent = rate.toFixed(2);
  } catch (err) {
    console.log(err);
    receiveAmountInput.value = "NAN";
  }
}

function searchCurrency(e) {
  const searchText = e.target.value.toLowerCase();
  const filterCurr = currencies.filter((currency) => {
    return (
      currency.code.toLowerCase().includes(searchText) ||
      currency.name.toLowerCase().includes(searchText)
    );
  });
  renderCurrencyList(filterCurr);
}

function drawChart(labels, values) {
  const ctx = document.getElementById("currencyChart");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `${sendCurrency.code} → ${receiveCurrency.code}`,
          data: values,
          borderColor: "#C8FF2C",
          backgroundColor: "rgba(200,255,44,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#fff" } },
      },
      scales: {
        x: { ticks: { color: "#999" }, grid: { color: "#222" } },
        y: { ticks: { color: "#999" }, grid: { color: "#222" } },
      },
    },
  });
}

const savingFav = function () {
  const key = `${sendCurrency.code}-${receiveCurrency.code}`;
  favCurr.set(key, {
    from: sendCurrency.code,
    to: receiveCurrency.code,
  });
  const favArr = [...favCurr.values()];
  if (favArr.length > 0) {
    emptyState.style.display = "none";
  } else {
    emptyState.style.display = "block";
  }
  localStorage.setItem("favorites", JSON.stringify([...favCurr.values()]));
  renderFav(favArr);
};

const renderFav = function (favArr) {
  favlist.innerHTML = "";
  favArr.forEach((fav) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${fav.from} → ${fav.to}</span>
      <button class="delete-btn">Delete</button>
    `;
    favlist.appendChild(li);
  });
  favBadge.innerHTML = favArr.length;
};

async function init() {
  const response = await fetch("./data/countries.json");
  currencies = await response.json();
  renderCurrencyList();

  sendCurrency = currencies.find((c) => c.code === "USD");
  receiveCurrency = currencies.find((c) => c.code === "INR");

  updateCurrency(sendCurrencyButton, sendCurrency);
  updateCurrency(receiveCurrencyButton, receiveCurrency);

  convertCurrency();
  await loadChart(today, sendCurrency, receiveCurrency, selectedRange);

  const saved = JSON.parse(localStorage.getItem("favorites")) || [];
  saved.forEach((item) => {
    favCurr.set(`${item.from}-${item.to}`, item);
  });
  renderFav(saved);

  await loadTicker();
}
init();

// LIVE MARKET TICKER

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

async function loadTicker() {
  const tickerList = document.querySelector(".ticker-list ul");
  tickerList.innerHTML = "";

  const yesterday = getYesterdayDate();

  for (const pair of tickerPairs) {
    try {
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?from=${pair.from}&to=${pair.to}`,
      );
      const data = await response.json();
      const rate = data.rates[pair.to];

      const oldResponse = await fetch(
        `https://api.frankfurter.dev/v1/${yesterday}?from=${pair.from}&to=${pair.to}`,
      );
      const oldData = await oldResponse.json();
      const oldRate = oldData.rates[pair.to];

      const change = ((rate - oldRate) / oldRate) * 100;
      const isUp = change >= 0;

      const li = document.createElement("li");
      li.className = "ticker-item";
      li.innerHTML = `
        <span class="ticker-item-pair">${pair.from}/${pair.to}</span>
        <span class="ticker-item-rate">${rate.toFixed(2)}</span>
        <span class="ticker-item-change ${isUp ? "ticker-item-change-up" : "ticker-item-change-down"}">
          ${isUp ? "▲" : "▼"} ${isUp ? "+" : ""}${change.toFixed(2)}%
        </span>
      `;
      tickerList.appendChild(li);
    } catch (err) {
      console.log(err);
    }
  }

  tickerList.innerHTML += tickerList.innerHTML;
}