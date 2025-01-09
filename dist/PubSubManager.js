"use strict";
//singleton pubsub managet >
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubManager = void 0;
const redis_1 = require("redis");
//what it does >>
/*

It keeps track of what all stocks are users on this server interested in
It tells the pub sub whenever a new stock is added or a stock is removed from the list of interested stocks on that server
It relays the events to the right sockets whenever an event is received

*/
class PubSubManager {
    //private constructor to prevent direct construction call
    constructor() {
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.connect();
        this.subscriptions = new Map();
    }
    //static method that controls the direct access to a single instance
    static getInstance() {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    //add user to a stock
    adduserToStock(userId, stock) {
        var _a, _b;
        //if the stock is not present in the pubsub manager then make an empty array for that stock
        if (!this.subscriptions.has(stock)) {
            this.subscriptions.set(stock, []);
        }
        //else we get the stock and add the user to the subscription list>
        (_a = this.subscriptions.get(stock)) === null || _a === void 0 ? void 0 : _a.push(userId);
        //if the stock subsctiptions of that stock is 1 that means the user is the first user to subscrive to that stock
        //then we subscribe to that stock
        if (((_b = this.subscriptions.get(stock)) === null || _b === void 0 ? void 0 : _b.length) == 1) {
            this.redisClient.subscribe(stock, (message) => {
                this.handleMessage(stock, message);
            });
            console.log(`subscribed to redis channel : ${stock}`);
        }
    }
    //remove user from the stock if they are not interested
    removeUserFromStock(userId, stock) {
        var _a, _b;
        //remove the user for that specific stock
        //@ts-ignore
        this.subscriptions.set(stock, (_a = this.subscriptions.get(stock)) === null || _a === void 0 ? void 0 : _a.filter((sub) => sub !== userId || []));
        //if the stock is 0 then unsubscribe from that stock >
        if (((_b = this.subscriptions.get(stock)) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            this.redisClient.unsubscribe(stock);
            console.log(`unsubscribed to Redis channel : ${stock}`);
        }
    }
    //message handler to all the users
    handleMessage(message, stock) {
        var _a;
        console.log(`Message received on channel ${stock} : ${message}`);
        (_a = this.subscriptions.get(stock)) === null || _a === void 0 ? void 0 : _a.forEach((sub) => {
            console.log(`Sending message to user : ${sub}`);
        });
    }
    disconncect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.quit();
        });
    }
}
exports.PubSubManager = PubSubManager;
