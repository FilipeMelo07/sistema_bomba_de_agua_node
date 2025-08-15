const express = require('express');
const mqtt = require('mqtt');

// --- Configurações da Aplicação e Tópicos ---
const PORTA = 3000;
const BROKER_URL = 'mqtt://localhost';
const TOPICO_COMANDO_MODO = 'esp32/comando/modo';
const TOPICO_COMANDO_RELE = 'esp32/comando/rele';
const TOPICO_COMANDO_DIST_LIGAR = 'esp32/comando/dist_ligar';
const TOPICO_COMANDO_DIST_DESLIGAR = 'esp32/comando/dist_desligar';
const TOPICO_STATUS_MODO = 'esp32/status/modo';
const TOPICO_STATUS_DISTANCIA = 'esp32/status/distancia';
const TOPICO_STATUS_BOMBA = 'esp32/status/bomba';

// --- Inicialização e Lógica MQTT ---
const app = express();
const client = mqtt.connect(BROKER_URL);
let clients = [];
client.on('connect', () => {
    console.log(`Conectado com sucesso ao Broker MQTT em: ${BROKER_URL}`);
    client.subscribe([TOPICO_STATUS_MODO, TOPICO_STATUS_DISTANCIA, TOPICO_STATUS_BOMBA], (err) => {
        if (!err) console.log('Inscrito nos tópicos de status do ESP32!');
    });
});
client.on('error', (error) => { console.error('Não foi possível conectar ao Broker MQTT.', error); process.exit(1); });
function sendEventToAll(data) { clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`)); }
client.on('message', (topic, message) => {
    let eventData;
    const msgString = message.toString();
    switch (topic) {
        case TOPICO_STATUS_MODO: eventData = { type: 'modo', value: msgString }; break;
        case TOPICO_STATUS_DISTANCIA: eventData = { type: 'distancia', value: msgString }; break;
        case TOPICO_STATUS_BOMBA: eventData = { type: 'bomba', value: msgString }; break;
    }
    if (eventData) sendEventToAll(eventData);
});

// --- Página de Controle (HTML, CSS e JS do Cliente) ---
const paginaDeControle = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Controle da Bomba</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background-color: #f4f6f9; margin: 0; padding: 1rem; box-sizing: border-box; }
        .container { text-align: center; background-color: white; padding: 1.5rem 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 480px; }
        h1, h2 { color: #333; margin-bottom: 1rem; }
        h2 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 1rem; border-top: 1px solid #eee; padding-top: 1.5rem;}
        button { display: block; width: 100%; padding: 16px; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 500; color: white; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
        .btn-ligar { background: linear-gradient(45deg, #28a745, #218838); }
        .btn-desligar { background: linear-gradient(45deg, #dc3545, #c82333); }
        .btn-auto { background: linear-gradient(45deg, #007bff, #0069d9); }
        .btn-manual { background: linear-gradient(45deg, #17a2b8, #138496); }
        .btn-atualizar { background: linear-gradient(45deg, #ffc107, #e0a800); color: #212529;}
        .status-container { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin-top: 1rem; text-align: left; }
        .status-container p { margin: 0.5rem 0; font-size: 1.1rem; color: #495057; }
        .status-container strong { color: #0056b3; font-weight: 600; }
        .form-group { display: flex; align-items: center; margin-bottom: 1rem; gap: 10px; }
        .form-group label { flex-basis: 65%; text-align: right; color: #495057; font-size: 1rem; }
        .form-group input { flex-basis: 35%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 1rem; text-align: center; }
        #command-status {
            margin-top: 1.5rem; padding: 12px; border-radius: 6px; font-size: 1rem; font-weight: bold;
            text-align: center; width: 100%; box-sizing: border-box; opacity: 0;
            transition: opacity 0.4s ease-in-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Painel de Controle da Bomba</h1>
        <h2>Status do Sistema</h2>
        <div class="status-container">
            <p>Modo Atual: <strong id="current-mode">--</strong></p>
            <p>Status da Bomba: <strong id="current-pump-status">--</strong></p>
            <p>Distância da água até o sensor: <strong id="current-distance">--</strong></p>
        </div>

        <h2>Modo de Operação</h2>
        <button class="btn-auto" onclick="enviarComando('${TOPICO_COMANDO_MODO}', 'AUTOMATICO')">Mudar para Modo Automático</button>
        <button class="btn-manual" onclick="enviarComando('${TOPICO_COMANDO_MODO}', 'MANUAL')">Mudar para Modo Manual</button>
        
        <h2>Configuração Automática</h2>
        <div class="form-group">
            <label for="dist-ligar">Ligar Bomba em (cm >):</label>
            <input type="number" id="dist-ligar" value="60" step="1">
        </div>
        <div class="form-group">
            <label for="dist-desligar">Desligar Bomba em (cm <):</label>
            <input type="number" id="dist-desligar" value="20" step="1">
        </div>
        <button class="btn-atualizar" onclick="atualizarLimites()">Atualizar Limites</button>

        <h2>Controle Manual da Bomba</h2>
        <p style="font-size: 0.9rem; color: #6c757d;">(Funciona apenas em Modo Manual)</p>
        <button class="btn-ligar" onclick="enviarComando('${TOPICO_COMANDO_RELE}', 'LIGAR')">Ligar Bomba</button>
        <button class="btn-desligar" onclick="enviarComando('${TOPICO_COMANDO_RELE}', 'DESLIGAR')">Desligar Bomba</button>
        
        <p id="command-status"></p>
    </div>

    <script>
        async function enviarComando(topico, mensagem) {
            const statusEl = document.getElementById('command-status');
            statusEl.textContent = 'Enviando comando...';
            statusEl.style.color = '#0c5460';
            statusEl.style.backgroundColor = '#d1ecf1';
            statusEl.style.opacity = 1;

            try {
                const response = await fetch(\`/publicar?topico=\${encodeURIComponent(topico)}&mensagem=\${encodeURIComponent(mensagem)}\`);
                if (!response.ok) throw new Error('Falha na resposta do servidor');
                statusEl.textContent = 'Comando enviado com sucesso!';
                statusEl.style.color = '#155724';
                statusEl.style.backgroundColor = '#d4edda';
            } catch (error) {
                statusEl.textContent = 'Falha ao enviar comando.';
                statusEl.style.color = '#721c24';
                statusEl.style.backgroundColor = '#f8d7da';
            } finally {
                setTimeout(() => { statusEl.style.opacity = 0; }, 3000);
            }
        }

        async function atualizarLimites() {
            const distLigarInput = document.getElementById('dist-ligar');
            const distDesligarInput = document.getElementById('dist-desligar');
            const statusEl = document.getElementById('command-status');

            const distLigar = parseFloat(distLigarInput.value);
            const distDesligar = parseFloat(distDesligarInput.value);

            function showStatusMessage(message, type) {
                statusEl.textContent = message;
                if (type === 'success') {
                    statusEl.style.color = '#155724';
                    statusEl.style.backgroundColor = '#d4edda';
                } else if (type === 'error') {
                    statusEl.style.color = '#721c24';
                    statusEl.style.backgroundColor = '#f8d7da';
                }
                statusEl.style.opacity = 1;
                setTimeout(() => { statusEl.style.opacity = 0; }, 4000);
            }

            if (isNaN(distLigar) || isNaN(distDesligar)) {
                showStatusMessage('Erro: Os valores de distância devem ser números.', 'error');
                return;
            }
            if (distLigar < distDesligar) {
                showStatusMessage('Erro: A distância para LIGAR deve ser maior ou igual à de desligar.', 'error');
                return;
            }

            try {
                // MODIFICAÇÃO: Corrigido o escopo das variáveis distLigar e distDesligar
                // Usamos '\$' para que a variável seja interpretada no navegador, e não no servidor.
                const [resLigar, resDesligar] = await Promise.all([
                    fetch(\`/publicar?topico=${TOPICO_COMANDO_DIST_LIGAR}&mensagem=\${encodeURIComponent(distLigar)}\`),
                    fetch(\`/publicar?topico=${TOPICO_COMANDO_DIST_DESLIGAR}&mensagem=\${encodeURIComponent(distDesligar)}\`)
                ]);

                if (resLigar.ok && resDesligar.ok) {
                    showStatusMessage('Limites atualizados com sucesso!', 'success');
                } else {
                    showStatusMessage('Erro: Falha ao enviar um ou mais limites.', 'error');
                }
            } catch (error) {
                showStatusMessage('Erro: Falha de comunicação com o servidor.', 'error');
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const modeEl = document.getElementById('current-mode');
            const distanceEl = document.getElementById('current-distance');
            const pumpStatusEl = document.getElementById('current-pump-status');
            const eventSource = new EventSource('/events');
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                switch(data.type) {
                    case 'modo': modeEl.textContent = data.value; break;
                    case 'distancia': distanceEl.textContent = /^[0-9.]+\$/.test(data.value) ? \`\${data.value} cm\` : data.value; break;
                    case 'bomba': pumpStatusEl.textContent = data.value; break;
                }
            };
            eventSource.onerror = function(err) {
                modeEl.textContent = "Desconectado";
                pumpStatusEl.textContent = "--";
                distanceEl.textContent = "--";
                eventSource.close();
            };
        });
    </script>
</body>
</html>
`;

// --- Rotas do Servidor Web e Inicialização ---
app.get('/', (req, res) => { res.send(paginaDeControle); });
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);
    req.on('close', () => { clients = clients.filter(c => c.id !== clientId); });
});
app.get('/publicar', (req, res) => {
    const { topico, mensagem } = req.query; 
    if (!topico || mensagem === undefined) { return res.status(400).send('Erro: Tópico e mensagem são obrigatórios.'); }
    client.publish(topico, mensagem, (error) => {
        if (error) return res.status(500).send('Erro ao contatar o dispositivo.');
        res.send(`Comando "${mensagem}" enviado!`);
    });
});
app.listen(PORTA, () => {
    console.log(`Servidor web iniciado! Acesse em http://localhost:${PORTA}`);
});