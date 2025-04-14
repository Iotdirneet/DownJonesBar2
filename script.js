const drinks = [
    { name: "Mojito", category: "Cócteles", price: 8.00, lastPrice: 8.00 },
    { name: "Margarita", category: "Cócteles", price: 9.00, lastPrice: 9.00 },
    { name: "Piña Colada", category: "Cócteles", price: 8.50, lastPrice: 8.50 },
    { name: "Daiquiri", category: "Cócteles", price: 7.50, lastPrice: 7.50 },
    { name: "Caipirinha", category: "Cócteles", price: 8.00, lastPrice: 8.00 },
    { name: "Negroni", category: "Cócteles", price: 9.50, lastPrice: 9.50 },
    { name: "Cosmopolitan", category: "Cócteles", price: 8.80, lastPrice: 8.80 },
    { name: "Old Fashioned", category: "Cócteles", price: 10.00, lastPrice: 10.00 },
    { name: "Gin Tonic", category: "Cócteles", price: 7.00, lastPrice: 7.00 },
    { name: "Martini", category: "Cócteles", price: 9.00, lastPrice: 9.00 },
    { name: "Heineken", category: "Cervezas", price: 4.50, lastPrice: 4.50 },
    { name: "Estrella Damm", category: "Cervezas", price: 4.00, lastPrice: 4.00 },
    { name: "Corona", category: "Cervezas", price: 4.80, lastPrice: 4.80 },
    { name: "Mahou", category: "Cervezas", price: 4.20, lastPrice: 4.20 },
    { name: "IPA Local", category: "Cervezas", price: 5.00, lastPrice: 5.00 },
    { name: "Limonada", category: "Sin Alcohol", price: 3.50, lastPrice: 3.50 },
    { name: "Mojito Sin", category: "Sin Alcohol", price: 4.00, lastPrice: 4.00 },
    { name: "Agua Tónica", category: "Sin Alcohol", price: 3.00, lastPrice: 3.00 },
    { name: "Cola Zero", category: "Sin Alcohol", price: 3.20, lastPrice: 3.20 },
    { name: "Smoothie de Frutas", category: "Sin Alcohol", price: 4.50, lastPrice: 4.50 }
];

let crashTime = 15 * 60; // 15 minutos en segundos

function updateDrinksBoard() {
    const board = document.getElementById('drinksBoard');
    board.innerHTML = '';
    drinks.forEach(drink => {
        const item = document.createElement('div');
        item.className = 'drink-item';
        const arrow = drink.price > drink.lastPrice ? '▲' : drink.price < drink.lastPrice ? '▼' : '';
        const arrowClass = drink.price > drink.lastPrice ? 'arrow-up' : drink.price < drink.lastPrice ? 'arrow-down' : '';
        item.innerHTML = `
            <span class="drink-name">${drink.name} (${drink.category})</span>
            <span class="drink-price">€${drink.price.toFixed(2)} <span class="${arrowClass}">${arrow}</span></span>
        `;
        board.appendChild(item);
    });
}

function updateTicker() {
    const ticker = document.getElementById('tickerContent');
    ticker.innerHTML = drinks.map(d => {
        const arrow = d.price > d.lastPrice ? '▲' : d.price < d.lastPrice ? '▼' : '';
        const arrowClass = d.price > d.lastPrice ? 'arrow-up' : d.price < d.lastPrice ? 'arrow-down' : '';
        return `${d.name}: €${d.price.toFixed(2)} <span class="${arrowClass}">${arrow}</span>`;
    }).join(' | ');
}

function updateSelect() {
    const select = document.getElementById('drinkSelect');
    select.innerHTML = drinks.map(d => `<option value="${d.name}">${d.name} - €${d.price.toFixed(2)}</option>`).join('');
}

function fluctuatePrices() {
    drinks.forEach(drink => {
        drink.lastPrice = drink.price;
        const change = (Math.random() * 0.04 - 0.02) * drink.price; // ±2%
        drink.price = Math.max(1, (drink.price + change)).toFixed(2);
    });
    updateDrinksBoard();
    updateTicker();
    updateSelect();
}

function buyDrink() {
    const select = document.getElementById('drinkSelect');
    const drink = drinks.find(d => d.name === select.value);
    if (drink) {
        drink.lastPrice = drink.price;
        drink.price = (drink.price * 1.02).toFixed(2); // +2% por compra
        updateDrinksBoard();
        updateTicker();
        updateSelect();
        showNotification(`¡Compraste ${drink.name} por €${drink.price}!`);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function crashMarket() {
    drinks.forEach(drink => {
        drink.lastPrice = drink.price;
        drink.price = (drink.price * 0.7).toFixed(2); // -30%
    });
    updateDrinksBoard();
    updateTicker();
    updateSelect();
    showNotification('¡CRASH DEL MERCADO! Todos los precios caen un 30%.');
    crashTime = 15 * 60;
}

function updateCrashTimer() {
    crashTime--;
    const minutes = Math.floor(crashTime / 60);
    const seconds = crashTime % 60;
    document.getElementById('crashTimer').textContent = `Próximo crash en: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (crashTime <= 0) {
        crashMarket();
    }
}

setInterval(fluctuatePrices, 120000); // Fluctuaciones cada 120 segundos
setInterval(updateCrashTimer, 1000); // Actualizar temporizador cada segundo
updateDrinksBoard();
updateTicker();
updateSelect();