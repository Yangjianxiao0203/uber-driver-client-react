import React,{useEffect,useState} from 'react'
import mqtt,{MqttClient} from 'mqtt';

interface ConnectionOptions {
    protocol: "ws" | "wss" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs" | undefined;
    host: string;
    port: number;
    endpoint: string;
    clean: boolean;
    connectTimeout: number;
    reconnectPeriod: number;
    clientId: string;
    username: string;
    password: string;
}
// mqtt: buffer is not defined error: https://github.com/mqttjs/MQTT.js/issues/1412#issuecomment-1046369875  node_modules/mqtt create webpack.config.js
const MqttConnector = () => {

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);
    // const [subscribeSuccess, setSubscribeSuccess] = useState(false);
    const [receivedMessage, setReceivedMessage] = useState('');

    const createConnection = () => {
        setConnecting(true);
    
        const connectionOptions:ConnectionOptions = {
          protocol: "ws",
          host: "localhost",
          port: 8083,
          // 默认的 endpoint 是 /mqtt
          endpoint: "/mqtt",
          clean: false,
          connectTimeout: 10000,
          reconnectPeriod: 4000,
          clientId: "driver_" + Math.random().toString(16).substr(2, 8),
          // auth
          username: "driver",
          password: "distinctive0930",
        };
    
        const connectUrl = `${connectionOptions.protocol}://${connectionOptions.host}:${connectionOptions.port}${connectionOptions.endpoint}`;
    
        const mqttClient = mqtt.connect(connectUrl, connectionOptions);
    
        mqttClient.on("connect", () => {
          setConnecting(false);
          console.log("Connection succeeded!");
        });
    
        mqttClient.on("reconnect", () => {
          console.log("Reconnecting...");
        });
    
        mqttClient.on("error", (error) => {
          console.log("Connection failed", error);
        });
    
        mqttClient.on("message", (topic, message) => {
          setReceivedMessage(message.toString());
          console.log(`Received message ${message} from topic ${topic}`);
        });
    
        setClient(mqttClient);
    };

    const destroyConnection = () => {
        if (client?.connected) {
          client.end(true, () => {
            setClient(null);
            console.log('Successfully disconnected!');
          });
        }
      };

    
    useEffect(() => {
        // createConnection();
        return () => {
            destroyConnection();
        };
    }, [client]);

    return (
      <div>
        <h1>MQTT Client</h1>
        {!connecting && !client?.connected && <button onClick={createConnection}>Connect</button>}
        {connecting && <button disabled>Connecting...</button>}
        {client?.connected && <button onClick={destroyConnection}>Disconnect</button>}
        <h2>Received Messages</h2>
        <p>{receivedMessage}</p>
      </div>
    )
}
export default MqttConnector;
