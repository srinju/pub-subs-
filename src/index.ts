import { PubSubManager } from "./PubSubManager"

//simulating users
setInterval(() => {
    PubSubManager.getInstance().adduserToStock(Math.random().toString() , 'APPL')
} , 5000);