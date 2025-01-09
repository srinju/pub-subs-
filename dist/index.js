"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PubSubManager_1 = require("./PubSubManager");
//simulating users
setInterval(() => {
    PubSubManager_1.PubSubManager.getInstance().adduserToStock(Math.random().toString(), 'APPL');
}, 5000);
