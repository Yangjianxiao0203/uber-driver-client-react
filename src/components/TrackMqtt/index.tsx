import mqtt,{ MqttClient } from "mqtt";
import React, {useEffect,useState} from "react";
import { ConnectionOptions } from "../../constant/index";

interface TrackMqttProps {
    userName: string;
    password: string;
    topic: string;
    qos: 0 | 1 | 2;
}

const TrackMqtt = ({userName,password,topic,qos}: TrackMqttProps) => {
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
          clientId: "track" + Math.random().toString(16).substr(2, 8),
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
        createConnection();
        return () => {
            destroyConnection();
        };
    }, []);

    return (
    <div>

    </div>
    )
}

export default TrackMqtt;