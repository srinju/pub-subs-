
//singleton pubsub managet >

import { createClient, RedisClientType } from "redis";

//what it does >>

/*

It keeps track of what all stocks are users on this server interested in
It tells the pub sub whenever a new stock is added or a stock is removed from the list of interested stocks on that server
It relays the events to the right sockets whenever an event is received

*/ 

export class PubSubManager {
    private static instance : PubSubManager
    private redisClient : RedisClientType
    private subscriptions : Map<string , string[]>
    //private constructor to prevent direct construction call
    private constructor() {
        this.redisClient = createClient();
        this.redisClient.connect();
        this.subscriptions = new Map();

    } 
    //static method that controls the direct access to a single instance
    public static getInstance(){
        if(!PubSubManager.instance){
            PubSubManager.instance = new PubSubManager();
        } 
        return PubSubManager.instance;
    }

    //add user to a stock
    adduserToStock(userId : string , stock : string){
        //if the stock is not present in the pubsub manager then make an empty array for that stock
        if(!this.subscriptions.has(stock)){
            this.subscriptions.set(stock , []);
        }
        //else we get the stock and add the user to the subscription list>
        this.subscriptions.get(stock)?.push(userId);
        //if the stock subsctiptions of that stock is 1 that means the user is the first user to subscrive to that stock
        //then we subscribe to that stock
        if(this.subscriptions.get(stock)?.length == 1){
            this.redisClient.subscribe(stock , (message) => {
                this.handleMessage(stock,message);
            });
            console.log(`subscribed to redis channel : ${stock}`);
        }
    }

    //remove user from the stock if they are not interested
    removeUserFromStock(userId : string , stock : string ){
        //remove the user for that specific stock
        //@ts-ignore
        this.subscriptions.set(stock , this.subscriptions.get(stock)?.filter((sub) => sub !== userId || []));

        //if the stock is 0 then unsubscribe from that stock >
        if(this.subscriptions.get(stock)?.length === 0){
            this.redisClient.unsubscribe(stock);
            console.log(`unsubscribed to Redis channel : ${stock}`);
        }
    }

    //message handler to all the users
    handleMessage(message : string , stock : string ){
        console.log(`Message received on channel ${stock} : ${message}`);
        this.subscriptions.get(stock)?.forEach((sub) => {
            console.log(`Sending message to user : ${sub}`);
        });
    }

    public async disconncect() {
        await this.redisClient.quit();
    }
}