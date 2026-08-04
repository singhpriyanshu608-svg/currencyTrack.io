const currlistcompare = [
  { code: "INR", flag: "🇮🇳" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "JPY", flag: "🇯🇵" },
  { code: "CAD", flag: "🇨🇦" },
];

const compareList = document.querySelector(".compare-list");
const compareAmountInput = document.querySelector(".compare-amount");

export async function renderCompare(baseCurrency) {
  compareList.innerHTML = "";
  const amount = Number(compareAmountInput.value) || 0;

  for (const curr of currlistcompare) {
    try {
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?from=${baseCurrency.code}&to=${curr.code}`,
      );
      const data = await response.json();
      const rate = data.rates[curr.code];
      const converted = (amount * rate).toFixed(2);

      const li = document.createElement("li");
      li.className = "compare-item";
      li.innerHTML = `
        <div class="compare-left">
          <span class="flag">${curr.flag}</span>
          <span class="code">${curr.code}</span>
        </div>
        <div class="compare-right">${converted}</div>
      `;
      compareList.appendChild(li);
    } catch (err) {
      console.log(err);
    }
  }
}

compareAmountInput.addEventListener("input", () => {
  renderCompare(window.compareBase || { code: "USD" });
});