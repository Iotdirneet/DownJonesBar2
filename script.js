// Determinar el modo (admin o cliente)
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const isAdmin = mode === 'admin';
const isClient = mode === 'client';
document.body.classList.add(isAdmin ? 'admin-mode' : 'client-mode');

// Configurar WebSocket
const ws = new WebSocket(`ws://${isClient ? 'localhost' : '192.168.1.100'}:8080`);

// Estado inicial
let drinks = [];
let config = {
    discountProbability: 0.005, // 0.5%
    discountPercentage: 0.1, // 10%
    discountDuration: 180000, // 3 minutos
    marketInterval: 30000, // 30 segundos
    crashTime: 300, // 5 minutos
    crashPercentage: 0.3, // 30%
    priceFluctuation: 0.02, // ±2%
    purchaseIncrease: 0.05, // 5%
    indexIncrement: 10, // 10 puntos
    tickerDuration: 80, // 80 segundos
    notificationTime: 3000 // 3 segundos
};
let marketIntervalId;
let index = 1000;
const history = [];
const cart = [];

// Precios iniciales de referencia
const INITIAL_DRINKS = [
    { id: 1, name: "Mojito", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false, discountEndTime: 0 },
    { id: 2, name: "Caipirinha", price: 7, popularity: 0, category: "cocktails", prevPrice: 7, discount: false, discountEndTime: 0 },
    { id: 3, name: "Gin Tonic", price: 9, popularity: 0, category: "cocktails", prevPrice: 9, discount: false, discountEndTime: 0 },
    { id: 4, name: "Margarita", price: 8, popularity: 0, category: "cocktails", prevPrice: 8, discount: false, discountEndTime: 0 },
    { id: 5, name: "Negroni", price: 10, popularity: 0, category: "cocktails", prevPrice: 10, discount: false, discountEndTime: 0 },
    { id: 6, name: "Old Fashioned", price: 11, popularity: 0, category: "cocktails", prevPrice: 11, discount: false, discountEndTime: 0 },
    { id: 7, name: "Daiquiri", price: 8.5, popularity: 0, category: "cocktails", prevPrice: 8.5, discount: false, discountEndTime: 0 },
    { id: 8, name: "Cerveza Artesanal", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false, discountEndTime: 0 },
    { id: 9, name: "IPA", price: 6, popularity: 0, category: "beers", prevPrice: 6, discount: false, discountEndTime: 0 },
    { id: 10, name: "Lager", price: 4.5, popularity: 0, category: "beers", prevPrice: 4.5, discount: false, discountEndTime: 0 },
    { id: 11, name: "Stout", price: 6.5, popularity: 0, category: "beers", prevPrice: 6.5, discount: false, discountEndTime: 0 },
    { id: 12, name: "Pilsner", price: 5, popularity: 0, category: "beers", prevPrice: 5, discount: false, discountEndTime: 0 },
    { id: 13, name: "Weissbier", price: 5.5, popularity: 0, category: "beers", prevPrice: 5.5, discount: false, discountEndTime: 0 },
    { id: 14, name: "Limonada", price: 3, popularity: 0, category: "non-alcoholic", prevPrice: 3, discount: false, discountEndTime: 0 },
    { id: 15, name: "Mojito Sin", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false, discountEndTime: 0 },
    { id: 16, name: "Té Helado", price: 3.5, popularity: 0, category: "non-alcoholic", prevPrice: 3.5, discount: false, discountEndTime: 0 },
    { id: 17, name: "Agua Tónica", price: 2.5, popularity: 0, category: "non-alcoholic", prevPrice: 2.5, discount: false, discountEndTime: 0 },
    { id: 18, name: "Zumo Natural", price: 4, popularity: 0, category: "non-alcoholic", prevPrice: 4, discount: false, discountEndTime: 0 },
    { id: 19, name: "Kombucha", price: 4.5, popularity: 0, category: "non-alcoholic", prevPrice: 4.5, discount: false, discountEndTime: 0 },
    { id: 20, name: "Smoothie", price: 5, popularity: 0, category: "non-alcoholic", prevPrice: 5, discount: false, discountEndTime: 0 }
];

// Inicializar bebidas solo para clientes
if (!isAdmin) drinks = [...INITIAL_DRINKS];

// Elementos del DOM
const cocktailsDiv = document.getElementById('cocktails');
const beersDiv = document.getElementById('beers');
const nonAlcoholicDiv = document.getElementById('non-alcoholic');
const ticker = document.getElementById('ticker');
const indexDisplay = document.getElementById('index-display');
const discountTimer = document.getElementById('discount-timer');
const notification = document.getElementById('notification');
const configPanel = document.getElementById('config-panel');
const configForm = document.getElementById('config-form');
const configButton = document.getElementById('config-button');
const configClose = document.getElementById('config-close');
const historyPanel = document.getElementById('history-panel');
const historyButton = document.getElementById('history-button');
const historyClose = document.getElementById('history-close');
const historyList = document.getElementById('history-list');
const cartPanel = document.getElementById('cart-panel');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const cartBuy = document.getElementById('cart-buy');
const cartClear = document.getElementById('cart-clear');
const cartClose = document.getElementById('cart-close');
const resetPricesButton = document.getElementById('reset-prices');

// Enviar estado al servidor
function sendState() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'update',
            drinks,
            config
        }));
    }
}

// Mostrar notificaciones
function showNotification(message, type) {
    notification.textContent = message;
    notification.classList.remove('hidden', 'success', 'error');
    notification.classList.add(type);
    setTimeout(() => notification.classList.add('hidden'), config.notificationTime);
}

// Actualizar formulario de configuración
function updateConfigForm() {
    if (!isAdmin) return;
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

// Mostrar bebidas
function displayDrinks() {
    cocktailsDiv.innerHTML = '';
    beersDiv.innerHTML = '';
    nonAlcoholicDiv.innerHTML = '';

    drinks.forEach(drink => {
        const div = document.createElement('div');
        div.className = 'drink-item';
        const price = drink.discount ? drink.price * (1 - config.discountPercentage) : drink.price;
        div.innerHTML = `
            <div class="name">${drink.name}${drink.discount ? '<span class="discount-text">OFERTA -' + (config.discountPercentage * 100) + '%</span>' : ''}</div>
            <div class="price">${price.toFixed(2)} €</div>
            <div class="popularity">Popularidad: ${drink.popularity}</div>
        `;
        if (isAdmin) {
            const addButton = document.createElement('button');
            addButton.textContent = 'Añadir';
            addButton.onclick = () => addToCart(drink.id);
            div.appendChild(addButton);
        }
        if (drink.category === 'cocktails') cocktailsDiv.appendChild(div);
        else if (drink.category === 'beers') beersDiv.appendChild(div);
        else if (drink.category === 'non-alcoholic') nonAlcoholicDiv.appendChild(div);
    });
}

// Actualizar ticker
function updateTicker() {
    ticker.innerHTML = drinks.map(drink => {
        const price = drink.discount ? drink.price * (1 - config.discountPercentage) : drink.price;
        return `${drink.name}: ${price.toFixed(2)} €`;
    }).join(' | ');
    ticker.style.animation = `ticker ${config.tickerDuration}s linear infinite`;
}

// Actualizar temporizador de descuentos
function updateDiscountTimer() {
    const now = Date.now();
    const activeDiscounts = drinks.filter(drink => drink.discount && drink.discountEndTime > now);
    if (activeDiscounts.length > 0) {
        const timeLeft = Math.max(...activeDiscounts.map(drink => drink.discountEndTime - now));
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        discountTimer.textContent = `${config.discountPercentage * 100}% en Bebidas (${minutes}:${seconds.toString().padStart(2, '0')})`;
        discountTimer.classList.remove('hidden');
    } else {
        discountTimer.classList.add('hidden');
    }
}

// Simular mercado
function simulateMarket() {
    const now = Date.now();
    drinks.forEach(drink => {
        if (drink.discount && now > drink.discountEndTime) {
            drink.discount = false;
            drink.discountEndTime = 0;
        }
        if (!drink.discount && Math.random() < config.discountProbability) {
            drink.discount = true;
            drink.discountEndTime = now + config.discountDuration;
            if (isAdmin) showNotification(`¡Oferta flash en ${drink.name}! -${config.discountPercentage * 100}%`, 'success');
        }
        if (!drink.discount) {
            drink.prevPrice = drink.price;
            const fluctuation = (Math.random() - 0.5) * 2 * config.priceFluctuation;
            drink.price = Math.max(0.1, drink.price * (1 + fluctuation));
        }
    });
    index += (Math.random() - 0.5) * 10;
    indexDisplay.textContent = `Índice Down Jones: ${Math.round(index)}`;
    displayDrinks();
    updateTicker();
    updateDiscountTimer();
    sendState();
}

// Añadir al carrito
function addToCart(drinkId) {
    const drink = drinks.find(d => d.id === drinkId);
    if (!drink) return;
    const cartItem = cart.find(item => item.id === drinkId);
    if (cartItem) cartItem.quantity++;
    else cart.push({ id: drinkId, name: drink.name, price: drink.discount ? drink.price * (1 - config.discountPercentage) : drink.price, quantity: 1 });
    updateCart();
}

// Actualizar carrito
function updateCart() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)} €`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Eliminar';
        removeButton.onclick = () => {
            item.quantity--;
            if (item.quantity === 0) cart.splice(cart.indexOf(item), 1);
            updateCart();
        };
        li.appendChild(removeButton);
        cartList.appendChild(li);
        total += item.price * item.quantity;
    });
    cartTotal.textContent = total.toFixed(2);
}

// Realizar compra
function buyCart() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío.', 'error');
        return;
    }
    cart.forEach(item => {
        const drink = drinks.find(d => d.id === item.id);
        if (drink) {
            drink.popularity += item.quantity;
            drink.price = drink.price * (1 + config.purchaseIncrease);
            drink.prevPrice = drink.price;
            history.push({ time: new Date().toLocaleString(), name: item.name, quantity: item.quantity, price: item.price });
        }
    });
    index += config.indexIncrement * cart.reduce((sum, item) => sum + item.quantity, 0);
    cart.length = 0;
    displayDrinks();
    updateCart();
    updateHistory();
    updateTicker();
    sendState();
    showNotification('Compra realizada.', 'success');
}

// Actualizar historial
function updateHistory() {
    historyList.innerHTML = '';
    history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.time}: ${entry.name} x${entry.quantity} a ${entry.price.toFixed(2)} €`;
        historyList.appendChild(li);
    });
}

// Manejo de WebSocket
ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'init' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'state') {
        drinks = data.drinks;
        config = data.config;
        displayDrinks();
        updateTicker();
        updateDiscountTimer();
        updateConfigForm();
        if (marketIntervalId) clearInterval(marketIntervalId);
        marketIntervalId = setInterval(simulateMarket, config.marketInterval);
    }
};

// Eventos de administración
if (isAdmin && configButton) {
    configButton.onclick = () => configPanel.classList.toggle('hidden');
}

if (isAdmin && configForm) {
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        config.discountProbability = parseFloat(document.getElementById('discount-probability').value) / 100;
        config.discountPercentage = parseFloat(document.getElementById('discount-percentage').value) / 100;
        config.discountDuration = parseInt(document.getElementById('discount-duration').value) * 1000;
        config.marketInterval = parseFloat(document.getElementById('market-interval').value) * 1000;
        config.crashTime = parseInt(document.getElementById('crash-time').value);
        config.crashPercentage = parseFloat(document.getElementById('crash-percentage').value) / 100;
        config.priceFluctuation = parseFloat(document.getElementById('price-fluctuation').value) / 100;
        config.purchaseIncrease = parseFloat(document.getElementById('purchase-increase').value) / 100;
        config.indexIncrement = parseInt(document.getElementById('index-increment').value);
        config.tickerDuration = parseInt(document.getElementById('ticker-duration').value);
        config.notificationTime = parseFloat(document.getElementById('notification-time').value) * 1000;

        if (marketIntervalId) clearInterval(marketIntervalId);
        marketIntervalId = setInterval(simulateMarket, config.marketInterval);

        displayDrinks();
        updateTicker();
        showNotification('Configuración actualizada.', 'success');
        configPanel.classList.add('hidden');
        sendState();
    });
}

if (isAdmin && resetPricesButton) {
    resetPricesButton.addEventListener('click', () => {
        drinks.forEach(drink => {
            const initialDrink = INITIAL_DRINKS.find(id => id.id === drink.id);
            if (initialDrink) {
                drink.price = initialDrink.price;
                drink.prevPrice = initialDrink.price;
                drink.discount = false;
                drink.discountEndTime = 0;
            }
        });
        displayDrinks();
        updateTicker();
        updateDiscountTimer();
        showNotification('Precios restablecidos a valores iniciales.', 'success');
        sendState();
    });
}

if (isAdmin && configClose) {
    configClose.onclick = () => configPanel.classList.add('hidden');
}

if (isAdmin && historyButton) {
    historyButton.onclick = () => historyPanel.classList.toggle('hidden');
}

if (isAdmin && historyClose) {
    historyClose.onclick = () => historyPanel.classList.add('hidden');
}

if (isAdmin && cartBuy) {
    cartBuy.onclick = buyCart;
}

if (isAdmin && cartClear) {
    cartClear.onclick = () => {
        cart.length = 0;
        updateCart();
    };
}

if (isAdmin && cartClose) {
    cartClose.onclick = () => cartPanel.classList.add('hidden');
}

if (isAdmin) {
    cocktailsDiv.addEventListener('click', () => cartPanel.classList.remove('hidden'));
    beersDiv.addEventListener('click', () => cartPanel.classList.remove('hidden'));
    nonAlcoholicDiv.addEventListener('click', () => cartPanel.classList.remove('hidden'));
}

// Inicialización
displayDrinks();
updateTicker();
updateDiscountTimer();
if (isAdmin) updateConfigForm();
marketIntervalId = setInterval(simulateMarket, config.marketInterval);