// Lista de bebidas con categorías
const drinks = [
    // Cócteles
    { id: 1, name: "Mojito", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false, discountEndTime: 0 },
    { id: 2, name: "Caipirinha", price: 7, popularity: 0, category: "cocktails", prevPrice: 7, discount: false, discountEndTime: 0 },
    { id: 3, name: "Gin Tonic", price: 9, popularity: 0, category: "cocktails", prevPrice: 9, discount: false, discountEndTime: 0 },
    { id: 4, name: "Margarita", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false, discountEndTime: 0 },
    { id: 5, name: "Negroni", price: 10, popularity: 0, category: "cocktails", prevPrice: 10, discount: false, discountEndTime: 0 },
    { id: 6, name: "Old Fashioned", price: 11, popularity: 0, category: "cocktails", prevPrice: 11, discount: false, discountEndTime: 0 },
    { id: 7, name: "Daiquiri", price: 8.5, popularity: 0, category: "cocktails", prevPrice: 8.5, discount: false, discountEndTime: 0 },
    // Cervezas
    { id: 8, name: "Cerveza Artesanal", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false, discountEndTime: 0 },
    { id: 9, name: "IPA", price: 6, popularity: 0, category: "beers", prevPrice: 6, discount: false, discountEndTime: 0 },
    { id: 10, name: "Lager", price: 4.5, popularity: 0, category: "beers", prevPrice: 4.5, discount: false, discountEndTime: 0 },
    { id: 11, name: "Stout", price: 6.5, popularity: 0, category: "beers", prevPrice: 6.5, discount: false, discountEndTime: 0 },
    { id: 12, name: "Pilsner", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false, discountEndTime: 0 },
    { id: 13, name: "Weissbier", price: 5.5, popularity: 0, category: "beers", prevPrice: 5.5, discount: false, discountEndTime: 0 },
    // Sin Alcohol
    { id: 14, name: "Limonada", price: 3, popularity: 0, category: "non-alcoholic", prevPrice: 3, discount: false, discountEndTime: 0 },
    { id: 15, name: "Mojito Sin", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false, discountEndTime: 0 },
    { id: 16, name: "Té Helado", price: 3.5, popularity: 0, category: "non-alcoholic", prevPrice: 3.5, discount: false, discountEndTime: 0 },
    { id: 17, name: "Agua Tónica", price: 2.5, popularity: 0, category: "non-alcoholic", prevPrice: 2.5, discount: false, discountEndTime: 0 },
    { id: 18, name: "Zumo Natural", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false, discountEndTime: 0 },
    { id: 19, name: "Kombucha", price: 4.5, popularity: 0, category: "non-alcoholic", prevPrice: 4.5, discount: false, discountEndTime: 0 },
    { id: 20, name: "Smoothie", price: 5, popularity: 0, category: "non-alcoholic", prevPrice: 5, discount: false, discountEndTime: 0 }
];

let cart = [];
let index = 1000;
let history = [];
let indexHistory = [1000];
let soundEnabled = false;

// Determinar modo desde la URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'admin';
document.body.classList.add(mode + '-mode');

const isAdmin = mode === 'admin';
const isClient = mode === 'client';

// Parámetros configurables
let config = {
    discountProbability: 0.02, // 2%
    discountPercentage: 0.1, // 10%
    discountDuration: 180000, // 3 minutos
    marketInterval: 10000, // 10 segundos
    crashTime: 300, // 5 minutos
    crashPercentage: 0.3, // 30%
    priceFluctuation: 0.02, // ±2%
    purchaseIncrease: 0.05, // 5%
    indexIncrement: 10, // 10 puntos
    tickerDuration: 80, // 80 segundos
    notificationTime: 3000 // 3 segundos
};

let marketIntervalId = null;

// Cargar configuración desde localStorage
function loadConfig() {
    const savedConfig = localStorage.getItem('barConfig');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
        if (isAdmin) {
            document.getElementById('discount-probability').value = config.discountProbability * 100;
            document.getElementById('discount-percentage').value = config.discountPercentage * 100;
            document.getElementById('discount-duration').value = config.discountDuration / 1000;
            document.getElementById('market-interval').value = config.marketInterval / 1000;
            document.getElementById('crash-time').value = config.crashTime;
            document.getElementById('crash-percentage').value = config.crashPercentage * 100;
            document.getElementById('price-fluctuation').value = config.priceFluctuation * 100;
            document.getElementById('purchase-increase').value = config.purchaseIncrease * 100;
            document.getElementById('index-increment').value = config.indexIncrement;
            document.getElementById('ticker-duration').value = config.tickerDuration;
            document.getElementById('notification-time').value = config.notificationTime / 1000;
        }
    }
}

// Guardar configuración en localStorage
function saveConfig() {
    localStorage.setItem('barConfig', JSON.stringify(config));
}

// Cargar bebidas desde localStorage
function loadDrinks() {
    const savedDrinks = localStorage.getItem('barDrinks');
    if (savedDrinks) {
        Object.assign(drinks, JSON.parse(savedDrinks));
    }
}

// Guardar bebidas en localStorage
function saveDrinks() {
    localStorage.setItem('barDrinks', JSON.stringify(drinks));
}

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
const configToggle = document.getElementById('config-toggle');
const configPanel = document.getElementById('config-panel');
const configForm = document.getElementById('config-form');
const configClose = document.getElementById('config-close');

// Gráfico con Chart.js (solo admin)
let indexChart;
if (isAdmin) {
    const ctx = document.getElementById('index-chart').getContext('2d');
    indexChart = new Chart(ctx, {
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
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);
    notification.style.animation = `slideIn 0.3s ease-out, slideOut 0.3s ease-in ${config.notificationTime - 300}ms forwards`;
    setTimeout(() => notification.remove(), config.notificationTime);
    if (isAdmin) saveDrinks();
}

// Mostrar bebidas por categoría
function displayDrinks() {
    cocktailsList.innerHTML = '';
    beersList.innerHTML = '';
    nonAlcoholicList.innerHTML = '';

    drinks.forEach(drink => {
        const drinkLi = document.createElement('li');
        drinkLi.classList.add('drink-item');
        if (drink.discount && drink.discountEndTime > Date.now()) {
            drinkLi.classList.add('discount');
        }
        const arrowClass = drink.price > drink.prevPrice ? 'arrow-up' : drink.price < drink.prevPrice ? 'arrow-down' : '';
        const displayPrice = (drink.discount && drink.discountEndTime > Date.now()) ? (drink.price * (1 - config.discountPercentage)).toFixed(2) : drink.price.toFixed(2);
        drinkLi.innerHTML = `
            <span class="name">${drink.name}${(drink.discount && drink.discountEndTime > Date.now()) ? `<span class="discount-text"> (Oferta -${(config.discountPercentage * 100).toFixed(0)}%)</span>` : ''}</span>
            <span class="price">€${displayPrice}</span>
            <span class="popularity">${drink.popularity}</span>
            <span class="price-change ${arrowClass}"></span>
            ${isAdmin ? `<button onclick="addToCart(${drink.id})">Añadir</button>` : ''}
        `;
        if (drink.category === 'cocktails') cocktailsList.appendChild(drinkLi);
        else if (drink.category === 'beers') beersList.appendChild(drinkLi);
        else nonAlcoholicList.appendChild(drinkLi);
    });
}

// Añadir al carrito (solo admin)
function addToCart(drinkId) {
    if (!isAdmin) return;
    const drink = drinks.find(d => d.id === drinkId);
    if (drink) {
        const cartItem = { ...drink, price: (drink.discount && drink.discountEndTime > Date.now()) ? drink.price * (1 - config.discountPercentage) : drink.price };
        cart.push(cartItem);
        updateCart();
        showNotification(`${drink.name} añadido al carrito`, 'success');
    }
}

// Actualizar carrito (solo admin)
function updateCart() {
    if (!isAdmin) return;
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name}${item.discount && item.discountEndTime > Date.now() ? ` (Oferta -${(config.discountPercentage * 100).toFixed(0)}%)` : ''} - €${item.price.toFixed(2)}`;
        cartItems.appendChild(li);
        total += item.price;
    });
    cartTotal.textContent = total.toFixed(2);
}

// Comprar bebidas (solo admin)
if (isAdmin && buyButton) {
    buyButton.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('El pedido está vacío.', 'error');
            return;
        }

        cart.forEach(item => {
            const drink = drinks.find(d => d.id === item.id);
            drink.popularity += 1;
            drink.prevPrice = drink.price;
            drink.price = drink.price * (1 + config.purchaseIncrease);
            drink.discount = false;
            drink.discountEndTime = 0;
        });

        index += cart.length * config.indexIncrement;
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
        saveDrinks();
    });
}

// Actualizar historial (solo admin)
function updateHistory() {
    if (!isAdmin) return;
    historyList.innerHTML = '';
    history.forEach((trans, index) => {
        const li = document.createElement('li');
        li.textContent = `Compra ${index + 1} (${trans.date}): ${trans.items.map(item => item.name + (item.discount && item.discountEndTime > Date.now() ? ' (Oferta)' : '')).join(', ')} - Total: €${trans.total.toFixed(2)}`;
        historyList.appendChild(li);
    });
}

// Simular mercado
function simulateMarket() {
    drinks.forEach(drink => {
        drink.prevPrice = drink.price;
        const fluctuation = (Math.random() * config.priceFluctuation * 2 - config.priceFluctuation);
        drink.price = Math.max(2, drink.price * (1 + fluctuation));
        if (!drink.discount && Math.random() < config.discountProbability) {
            drink.discount = true;
            drink.discountEndTime = Date.now() + config.discountDuration;
            showNotification(`¡Oferta flash en ${drink.name}! -${(config.discountPercentage * 100).toFixed(0)}%`, 'info');
        }
    });
    index = Math.max(500, index * (1 + (Math.random() * 0.02 - 0.01)));
    updateIndex();
    displayDrinks();
    updateTicker();
    saveDrinks();
}

// Actualizar descuentos
function updateDiscounts() {
    let updated = false;
    drinks.forEach(drink => {
        if (drink.discount && drink.discountEndTime <= Date.now()) {
            drink.discount = false;
            drink.discountEndTime = 0;
            updated = true;
        }
    });
    if (updated) {
        displayDrinks();
        updateTicker();
        saveDrinks();
    }
}

// Actualizar índice y gráfico (gráfico solo admin)
function updateIndex() {
    indexValue.textContent = index.toFixed(2);
    if (isAdmin) {
        indexHistory.push(index);
        if (indexHistory.length > 50) indexHistory.shift();
        indexChart.data.labels = Array(indexHistory.length).fill('').map((_, i) => i);
        indexChart.data.datasets[0].data = indexHistory;
        indexChart.update();
    }
}

// Temporizador de crash
function updateCrashTimer() {
    config.crashTime--;
    const minutes = Math.floor(config.crashTime / 60);
    const seconds = config.crashTime % 60;
    crashTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (config.crashTime <= 0) {
        crashMarket();
        config.crashTime = isAdmin ? parseInt(document.getElementById('crash-time').value) : config.crashTime;
    }
}

// Temporizador de descuento
function updateDiscountTimer() {
    const activeDiscounts = drinks.filter(drink => drink.discount && drink.discountEndTime > Date.now());
    if (activeDiscounts.length > 0) {
        const latestDiscount = activeDiscounts.reduce((latest, drink) => 
            drink.discountEndTime > latest.discountEndTime ? drink : latest, activeDiscounts[0]);
        const timeLeft = Math.max(0, Math.floor((latestDiscount.discountEndTime - Date.now()) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        discountTimer.textContent = `${(config.discountPercentage * 100).toFixed(0)}% en Bebidas (${minutes}:${seconds.toString().padStart(2, '0')})`;
        discountTimer.classList.remove('static');
    } else {
        discountTimer.textContent = 'Esperando próxima oferta...';
        discountTimer.classList.add('static');
    }
}

// Crash del mercado
function crashMarket() {
    drinks.forEach(drink => {
        drink.prevPrice = drink.price;
        drink.price = drink.price * (1 - config.crashPercentage);
        drink.discount = false;
        drink.discountEndTime = 0;
    });
    index *= (1 - config.crashPercentage);
    updateIndex();
    displayDrinks();
    updateTicker();
    indexSection.classList.add('crash');
    setTimeout(() => indexSection.classList.remove('crash'), 3000);
    if (isAdmin && soundEnabled && crashSound) crashSound.play().catch(() => {});
    showNotification(`¡Crash! Precios caídos un ${(config.crashPercentage * 100).toFixed(0)}%.`, 'error');
}

// Actualizar ticker
function updateTicker() {
    tickerContent.innerHTML = '';
    drinks.forEach(drink => {
        const span = document.createElement('span');
        span.classList.add('ticker-item');
        const arrowClass = drink.price > drink.prevPrice ? 'arrow-up' : drink.price < drink.prevPrice ? 'arrow-down' : '';
        const displayPrice = (drink.discount && drink.discountEndTime > Date.now()) ? (drink.price * (1 - config.discountPercentage)).toFixed(2) : drink.price.toFixed(2);
        span.innerHTML = `${drink.name}${(drink.discount && drink.discountEndTime > Date.now()) ? ` (-${(config.discountPercentage * 100).toFixed(0)}%)` : ''}: €${displayPrice} <span class="${arrowClass}"></span> | `;
        tickerContent.appendChild(span);
    });
    tickerContent.style.animationDuration = `${config.tickerDuration}s`;
}

// Alternar sonido (solo admin)
if (isAdmin && soundToggle) {
    soundToggle.addEventListener('change', () => {
        soundEnabled = soundToggle.checked;
    });
}

// Alternar tema (solo admin)
if (isAdmin && themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (indexChart) {
            indexChart.data.datasets[0].borderColor = document.body.classList.contains('light-theme') ? '#d32f2f' : '#00ffcc';
            indexChart.data.datasets[0].backgroundColor = document.body.classList.contains('light-theme') ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 255, 204, 0.1)';
            indexChart.update();
        }
    });
}

// Configuración (solo admin)
if (isAdmin && configToggle) {
    configToggle.addEventListener('click', () => {
        configPanel.classList.toggle('hidden');
    });
}

if (isAdmin && configClose) {
    configClose.addEventListener('click', () => {
        configPanel.classList.add('hidden');
    });
}

if (isAdmin && configForm) {
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        config.discountProbability = parseFloat(document.getElementById('discount-probability').value) / 100;
        config.discountPercentage = parseFloat(document.getElementById('discount-percentage').value) / 100;
        config.discountDuration = parseInt(document.getElementById('discount-duration').value) * 1000;
        config.marketInterval = parseInt(document.getElementById('market-interval').value) * 1000;
        config.crashTime = parseInt(document.getElementById('crash-time').value);
        config.crashPercentage = parseFloat(document.getElementById('crash-percentage').value) / 100;
        config.priceFluctuation = parseFloat(document.getElementById('price-fluctuation').value) / 100;
        config.purchaseIncrease = parseFloat(document.getElementById('purchase-increase').value) / 100;
        config.indexIncrement = parseInt(document.getElementById('index-increment').value);
        config.tickerDuration = parseInt(document.getElementById('ticker-duration').value);
        config.notificationTime = parseFloat(document.getElementById('notification-time').value) * 1000;

        // Reiniciar intervalo de mercado
        if (marketIntervalId) clearInterval(marketIntervalId);
        marketIntervalId = setInterval(simulateMarket, config.marketInterval);

        // Actualizar interfaz
        displayDrinks();
        updateTicker();
        showNotification('Configuración actualizada.', 'success');
        configPanel.classList.add('hidden');
        saveConfig();
        saveDrinks();
    });
}

// Sincronizar datos desde localStorage
function syncData() {
    loadDrinks();
    loadConfig();
    displayDrinks();
    updateTicker();
    updateDiscountTimer();
}

// Escuchar cambios en localStorage
window.addEventListener('storage', (event) => {
    if (event.key === 'barDrinks' || event.key === 'barConfig') {
        syncData();
    }
});

// Iniciar
loadConfig();
loadDrinks();
displayDrinks();
updateTicker();
marketIntervalId = setInterval(simulateMarket, config.marketInterval);
setInterval(updateCrashTimer, 1000);
setInterval(updateDiscountTimer, 1000);
setInterval(updateDiscounts, 1000);