## projeto completo 
para acessar o projeto principal com o tutorial de funcionamento completo acesse: [https://github.com/FilipeMelo07/sistema_bomba_de_agua.git](https://github.com/FilipeMelo07/sistema_bomba_de_agua.git)


##  Painel de Controle Web (Servidor Node.js)

Para controlar e monitorar o ESP32 de forma amigável, este projeto inclui um servidor web leve, construído com **Node.js** e **Express**. Ele atua como uma ponte entre o usuário (através do navegador) e o dispositivo (via MQTT), fornecendo uma interface gráfica em tempo real.

###  Funcionalidades do Painel

* **Interface Web Responsiva:** Acesse o painel de qualquer dispositivo com um navegador, seja um computador ou smartphone.
* **Visualização em Tempo Real:** Veja o status atual da bomba, o modo de operação e a distância medida pelo sensor, tudo atualizado automaticamente sem precisar recarregar a página.
* **Controle Total:** Altere o modo de operação entre **Automático** e **Manual**.
* **Comandos Manuais:** Ligue e desligue a bomba diretamente pela interface (quando em modo manual).
* **Configuração Remota:** Ajuste e envie os limites de distância para ligar e desligar a bomba no modo automático.

###  Guia de Instalação do Painel

Siga os passos abaixo para rodar o servidor do painel de controle na sua máquina local.

#### **Pré-requisitos**

1.  **Node.js e npm:** Você precisa ter o [Node.js](https://nodejs.org/) instalado. O npm (Node Package Manager) já vem incluído. Para verificar se estão instalados, abra um terminal e digite `node -v` e `npm -v`.


#### **Passo 1: Preparar o Projeto**

Abra um terminal e clone este repositório para sua máquina:

git clone [https://github.com/FilipeMelo07/sistema_bomba_de_agua_node.git](https://github.com/FilipeMelo07/sistema_bomba_de_agua_node.git)

2.  Abra um terminal na mesma pasta do projeto.

### **Passo 2: Instalar as Dependências**

O servidor depende de duas bibliotecas principais: `express` e `mqtt`. Execute o comando abaixo para instalá-las:

```bash
npm install express mqtt
```
Este comando criará uma pasta `node_modules` e um arquivo `package-lock.json`.

#### **Passo 3: Iniciar o Broker MQTT**

Se o seu broker MQTT (como o Mosquitto) não estiver rodando, inicie-o agora em um terminal separado.

#### **Passo 4: Rodar o Servidor**

Agora que as dependências estão instaladas e o broker está online, inicie o servidor Node.js com o seguinte comando:

```bash
node servidor.js
```

Se tudo ocorrer bem, você verá as seguintes mensagens no terminal:

```
Conectado com sucesso ao Broker MQTT em: mqtt://localhost
Inscrito nos tópicos de status do ESP32!
Servidor web iniciado! Acesse em http://localhost:3000
```

#### **Passo 5: Acessar o Painel**

Abra seu navegador de internet e acesse o endereço:

**[http://localhost:3000](http://localhost:3000)**

Pronto! Agora você pode ver os dados enviados pelo seu ESP32 em tempo real e enviar comandos para controlar a bomba d'água diretamente da página web.

---


