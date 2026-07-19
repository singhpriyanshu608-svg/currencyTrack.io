  let chart;
  function drawChart(labels, values, sendCurrency, receiveCurrency) {
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
          legend: {
            labels: {
              color: "#fff",
            },
          },
        },

        scales: {
          x: {
            ticks: {
              color: "#999",
            },
            grid: {
              color: "#222",
            },
          },

          y: {
            ticks: {
              color: "#999",
            },
            grid: {
              color: "#222",
            },
          },
        },
      },
    });
  }

  
  export const loadChart = async function (
    today,
    sendCurrency,
    receiveCurrency,
    selectedRange,
  ) {
    try {
      const from = sendCurrency.code;
      const to = receiveCurrency.code;
      const startDate = today.toISOString().split("T")[0];
      console.log(startDate);
      const endDateObj = new Date(today);
      endDateObj.setDate(endDateObj.getDate() - Number(selectedRange));
      const endDate = endDateObj.toISOString().split("T")[0];
      console.log(selectedRange);
      console.log(endDate);
      const response = await fetch(
        `https://api.frankfurter.dev/v1/${endDate}..${startDate}?from=${from}&to=${to}`,
      );
      console.log(response);
      const data = await response.json();
      console.log(data);
      const labels = Object.keys(data.rates);
      const values = Object.values(data.rates).map((rates) => rates[to]);
      console.log(labels);
      console.log(values);
      drawChart(labels, values , sendCurrency , receiveCurrency);
    } catch (err) {
      console.log(`the error is ${err}`);
    }
  };
