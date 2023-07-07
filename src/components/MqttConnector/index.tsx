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

interface MqttConnectorProps {
  userName: string;
  password: string;
  topic: string;
  qos: 0 | 1 | 2;
  setForm: React.Dispatch<React.SetStateAction<any[]>>
}
const MqttConnector = ({userName,password,topic,qos,setForm}:MqttConnectorProps) => {

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);

    const [receivedMessage, setReceivedMessage] = useState('');


    const [reconnectAttempts, setReconnectAttempts] = useState(0);

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
          username: userName,
          password: password,
        };
    
        const connectUrl = `${connectionOptions.protocol}://${connectionOptions.host}:${connectionOptions.port}${connectionOptions.endpoint}`;
    
        const mqttClient = mqtt.connect(connectUrl, connectionOptions);
    
        mqttClient.on("connect", () => {
          setConnecting(false);
          console.log("Connection succeeded!");
            // Subscribe to the topic
          mqttClient.subscribe(topic, {qos: qos}, (error) => {
            if (error) {
              console.log('Error subscribing to topic:', error);
            } else {
              console.log(`Successfully subscribed to topic: ${topic}`);
            }
          });
        });
    
        mqttClient.on("reconnect", () => {
          console.log("Reconnecting...");
          if (reconnectAttempts >= 5) { // 如果重连次数超过5次
            console.log("Max reconnect attempts reached. Stopping...");
            mqttClient.end(); // 停止重连
          } else {
            setReconnectAttempts(reconnectAttempts + 1); // 增加重连次数
          }
        });
    
        mqttClient.on("error", (error) => {
          console.log("Connection failed", error);
        });
    
        mqttClient.on("message", (topic, message) => {
          const newRide = JSON.parse(message.toString());
          setReceivedMessage(message.toString());
          console.log(`Received message ${message} from topic ${topic}`);
          setForm((prev) => {
            //todo: if not created, delete it from the list
            return [...prev,newRide]
          })
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
        createConnection();
        return () => {
            destroyConnection();
        };
    }, []);

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
