const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Estado inicial (puede inicializarse desde un archivo o base de datos)
let state = {
    drinks: [
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
    ],
    config: {
        discountProbability: 0.02,
        discountPercentage: 0.1,
        discountDuration: 180000,
        marketInterval: 10000,
        crashTime: 300,
        crashPercentage: 0.3,
        priceFluctuation: 0.02,
        purchaseIncrease: 0.05,
        indexIncrement: 10,
        tickerDuration: 80,
        notificationTime: 3000
    }
};

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    // Enviar estado inicial al nuevo cliente
    ws.send(JSON.stringify({
        type: 'state',
        drinks: state.drinks,
        config: state.config
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'init') {
            // Enviar estado actual
            ws.send(JSON.stringify({
                type: 'state',
                drinks: state.drinks,
                config: state.config
            }));
        } else if (data.type === 'update') {
            // Actualizar estado
            state.drinks = data.drinks;
            state.config = data.config;

            // Transmitir a todos los clientes
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'state',
                        drinks: state.drinks,
                        config: state.config
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar servidor
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});