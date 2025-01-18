// HTML Elements
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const convertButton = document.getElementById('convert');
const resultDiv = document.getElementById('result');
const chartCanvas = document.getElementById('chart');

// Fetch Exchange Rates
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        resultDiv.textContent = 'Error al obtener los tipos de cambio. Intente nuevamente más tarde.';
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

// Convert Currency
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    const rates = await fetchExchangeRates();

    if (rates && amount && amount > 0) {
        let exchangeRate;

        switch (currency) {
            case 'dolar':
                exchangeRate = rates.dolar.valor;
                break;
            case 'euro':
                exchangeRate = rates.euro.valor;
                break;
            default:
                exchangeRate = NaN;
        }

        if (!isNaN(exchangeRate)) {
            const result = (amount / exchangeRate).toFixed(2);
            resultDiv.textContent = `Resultado: $${result}`;
            await renderHistoricalData(currency);
        } else {
            resultDiv.textContent = 'Error: Moneda no soportada.';
        }
    } else {
        resultDiv.textContent = 'Por favor, ingrese un monto válido y seleccione una moneda.';
    }
}

// Render Historical Data
async function renderHistoricalData(currency) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const labels = data.serie.slice(0, 10).reverse().map(entry => entry.fecha.split('T')[0]);
        const values = data.serie.slice(0, 10).reverse().map(entry => entry.valor);

        const ctx = document.getElementById('chart').getContext('2d');

        // Identify increases and decreases in value
        const backgroundColors = values.map((value, index) => {
            if (index > 0) {
                return value > values[index - 1] ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)';
            }
            return 'rgba(75, 192, 192, 0.2)';
        });

        const borderColors = values.map((value, index) => {
            if (index > 0) {
                return value > values[index - 1] ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
            }
            return 'rgba(75, 192, 192, 1)';
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Historial últimos 10 días',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    fill: false,
                }]
            },
            options: {
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching historical data:', error);
        resultDiv.textContent = 'Error al obtener el historial. Intente nuevamente más tarde.';
    }
}

// Event Listener
convertButton.addEventListener('click', convertCurrency);
