// Lista de bebidas con categorías
const drinks = [
    // Cócteles
    { id: 1, name: "Mojito", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false },
    { id: 2, name: "Caipirinha", price: 7, popularity: 0, category: "cocktails", prevPrice: 7, discount: false },
    { id: 3, name: "Gin Tonic", price: 9, popularity: 0, category: "cocktails", prevPrice: 9, discount: false },
    { id: 4, name: "Margarita", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false },
    { id: 5, name: "Negroni", price: 10, popularity: 0, category: "cocktails", prevPrice: 10, discount: false },
    { id: 6, name: "Old Fashioned", price: 11, popularity: 0, category: "cocktails", prevPrice: 11, discount: false },
    { id: 7, name: "Daiquiri", price: 8.5, popularity: 0, category: "cocktails", prevPrice: 8.5, discount: false },
    // Cervezas
    { id: 8, name: "Cerveza Artesanal", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false },
    { id: 9, name: "IPA", price: 6, popularity: 0, category: "beers", prevPrice: 6, discount: false },
    { id: 10, name: "Lager", price: 4.5, popularity: 0, category: "beers", prevPrice: 4.5, discount: false },
    { id: 11, name: "Stout", price: 6.5, popularity: 0, category: "beers", prevPrice: 6.5, discount: false },
    { id: 12, name: "Pilsner", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false },
    { id: 13, name: "Weissbier", price: 5.5, popularity: 0, category: "beers", prevPrice: 5.5, discount: false },
    // Sin Alcohol
    { id: 14, name: "Limonada", price: 3, popularity: 0, category: "non-alcoholic", prevPrice: 3, discount: false },
    { id: 15, name: "Mojito Sin", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false },
    { id: 16, name: "Té Helado", price: 3.5, popularity: 0, category: "non-alcoholic", prevPrice: 3.5, discount: false },
    { id: 17, name: "Agua Tónica", price: 2.5, popularity: 0, category: "non-alcoholic", prevPrice: 2.5, discount: false },
    { id: 18, name: "Zumo Natural", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false },
    { id: 19, name: "Kombucha", price: 4.5, popularity: 0, category: "non-alcoholic", prevPrice: 4.5, discount: false },
    { id: 20, name: "Smoothie", price: 5, popularity: 0, category: "non-alcoholic", prevPrice: 5, discount: false }
];

let cart = [];
let index = 1000;
let history = [];
let indexHistory = [1000];
let crashTime = 300; // 5 minutos en segundos
let discountTime = 10; // Sincronizado con simulateMarket (10 segundos)
let soundEnabled = false;

// Elementos del DOM
const cocktailsList = document.getElementById('cocktails-list');
const beersList = document.getElementById('beers-list');
const nonAlcoholicList = document.getElementById('non-alcoholic-list');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const buyButton = document.getElementById('buy-button');
const historyList = document.getElementById('history-list');
const indexValue = document.getElementById('index-value');
const crashTimer = document.getElementById('crash-timer');
const discountTimer = document.getElementById('discount-timer');
const tickerContent = document.getElementById('ticker-content');
const indexSection = document.querySelector('.index');
const soundToggle = document.getElementById('sound-toggle');
const themeToggle = document.getElementById('theme-toggle');
const crashSound = document.getElementById('crash-sound');
const notifications = document.getElementById('notifications');

// Gráfico con Chart.js
const ctx = document.getElementById('index-chart').getContext('2d');
const indexChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Índice Down Jones',
            data: indexHistory,
            borderColor: '#00ffcc',
            backgroundColor: 'rgba(0, 255, 204, 0.1)',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: { display: false },
            y: { beginAtZero: false }
        }
    }
});

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Mostrar bebidas por categoría
function displayDrinks() {
    cocktailsList.innerHTML = '';
    beersList.innerHTML = '';
    nonAlcoholicList.innerHTML = '';

    drinks.forEach(drink => {
        const drinkLi = document.createElement('li');
        drinkLi.classList.add('drink-item');
        if (drink.discount) drinkLi.classList.add('discount');
        const arrowClass = drink.price > drink.prevPrice ? 'arrow-up' : drink.price < drink.prevPrice ? 'arrow-down' : '';
        const displayPrice = drink.discount ? (drink.price * 0.9).toFixed(2) : drink.price.toFixed(2);
        drinkLi.innerHTML = `
            <span class="name">${drink.name}${drink.discount ? '<span class="discount-text"> (Oferta -10%)</span>' : ''}</span>
            <span class="price">€${displayPrice}</span>
            <span class="popularity">${drink.popularity}</span>
            <span class="price-change ${arrowClass}"></span>
            <button onclick="addToCart(${drink.id})">Añadir</button>
        `;
        if (drink.category === 'cocktails') cocktailsList.appendChild(drinkLi);
        else if (drink.category === 'beers') beersList.appendChild(drinkLi);
        else nonAlcoholicList.appendChild(drinkLi);
    });
}

// Añadir al carrito
function addToCart(drinkId) {
    const drink = drinks.find(d => d.id === drinkId);
    if (drink) {
        const cartItem = { ...drink, price: drink.discount ? drink.price * 0.9 : drink.price };
        cart.push(cartItem);
        updateCart();
        showNotification(`${drink.name} añadido al carrito`, 'success');
    }
}

// Actualizar carrito
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name}${item.discount ? ' (Oferta -10%)' : ''} - €${item.price.toFixed(2)}`;
        cartItems.appendChild(li);
        total += item.price;
    });
    cartTotal.textContent = total.toFixed(2);
}

// Comprar bebidas
buyButton.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('El pedido está vacío.', 'error');
        return;
    }

    cart.forEach(item => {
        const drink = drinks.find(d => d.id === item.id);
        drink.popularity += 1;
        drink.prevPrice = drink.price;
        drink.price = drink.price * 1.05;
        drink.discount = false;
    });

    index += cart.length * 10;
    updateIndex();

    const transaction = {
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price, 0),
        date: new Date().toLocaleString()
    };
    history.push(transaction);

    showNotification(`Compra realizada por €${transaction.total.toFixed(2)}!`, 'success');
    updateHistory();
    cart = [];
    updateCart();
    displayDrinks();
    updateTicker();
});

// Actualizar historial
function updateHistory() {
    historyList.innerHTML = '';
    history.forEach((trans, index) => {
        const li = document.createElement('li');
        li.textContent = `Compra ${index + 1} (${trans.date}): ${trans.items.map(item => item.name + (item.discount ? ' (Oferta)' : '')).join(', ')} - Total: €${trans.total.toFixed(2)}`;
        historyList.appendChild(li);
    });
}

// Simular mercado
function simulateMarket() {
    drinks.forEach(drink => {
        drink.prevPrice = drink.price;
        const fluctuation = (Math.random() * 0.04 - 0.02);
        drink.price = Math.max(2, drink.price * (1 + fluctuation));
        const wasDiscounted = drink.discount;
        drink.discount = Math.random() < 0.02; // Probabilidad reducida a 2%
        if (!wasDiscounted && drink.discount) {
            showNotification(`¡Oferta flash en ${drink.name}! -10%`, 'info');
        }
    });
    index = Math.max(500, index * (1 + (Math.random() * 0.02 - 0.01)));
    updateIndex();
    displayDrinks();
    updateTicker();
    discountTime = 10; // Reinicia el temporizador de descuento
}

// Actualizar índice y gráfico
function updateIndex() {
    indexValue.textContent = index.toFixed(2);
    indexHistory.push(index);
    if (indexHistory.length > 50) indexHistory.shift();
    indexChart.data.labels = Array(indexHistory.length).fill('').map((_, i) => i);
    indexChart.data.datasets[0].data = indexHistory;
    indexChart.update();
}

// Temporizador de crash
function updateCrashTimer() {
    crashTime--;
    const minutes = Math.floor(crashTime / 60);
    const seconds = crashTime % 60;
    crashTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (crashTime <= 0) {
        crashMarket();
        crashTime = 300;
    }
}

// Temporizador de descuento
function updateDiscountTimer() {
    discountTime--;
    const seconds = discountTime % 60;
    discountTimer.textContent = `10% en Bebidas (${seconds}s)`;
    if (discountTime <= 0) {
        discountTime = 10; // Reinicia cada 10 segundos, alineado con simulateMarket
    }
}

// Crash del mercado
function crashMarket() {
    drinks.forEach(drink => {
        drink.prevPrice = drink.price;
        drink.price = drink.price * 0.7;
        drink.discount = false;
    });
    index *= 0.6;
    updateIndex();
    displayDrinks();
    updateTicker();
    indexSection.classList.add('crash');
    setTimeout(() => indexSection.classList.remove('crash'), 3000);
    if (soundEnabled && crashSound) crashSound.play().catch(() => {});
    showNotification('¡Crash! Precios caídos un 30%.', 'error');
}

// Actualizar ticker
function updateTicker() {
    tickerContent.innerHTML = '';
    drinks.forEach(drink => {
        const span = document.createElement('span');
        span.classList.add('ticker-item');
        const arrowClass = drink.price > drink.prevPrice ? 'arrow-up' : drink.price < drink.prevPrice ? 'arrow-down' : '';
        const displayPrice = drink.discount ? (drink.price * 0.9).toFixed(2) : drink.price.toFixed(2);
        span.innerHTML = `${drink.name}${drink.discount ? ' (-10%)' : ''}: €${displayPrice} <span class="${arrowClass}"></span> | `;
        tickerContent.appendChild(span);
    });
}

// Alternar sonido
soundToggle.addEventListener('change', () => {
    soundEnabled = soundToggle.checked;
});

// Alternar tema
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    indexChart.data.datasets[0].borderColor = document.body.classList.contains('light-theme') ? '#d32f2f' : '#00ffcc';
    indexChart.data.datasets[0].backgroundColor = document.body.classList.contains('light-theme') ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 255, 204, 0.1)';
    indexChart.update();
});

// Iniciar
displayDrinks();
updateTicker();
setInterval(simulateMarket, 10000);
setInterval(updateCrashTimer, 1000);
setInterval(updateDiscountTimer, 1000);