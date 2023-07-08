// ConnectionManager.js
import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import { ConnectionOptions } from "../../constant";

interface ConnectionManagerProps {
    userName: string;
    password: string;
    channelName: string;
    setClient: React.Dispatch<React.SetStateAction<MqttClient | null>>;
    setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
    userName,
    password,
    channelName,
    setClient,
    setConnecting,
}) => {

    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        setConnecting(true);
    
        const connectionOptions:ConnectionOptions = {
          protocol: "ws",
          host: "localhost",
          port: 8083,
          endpoint: "/mqtt",
          clean: false,
          connectTimeout: 10000,
          reconnectPeriod: 4000,
          clientId: "track" + Math.random().toString(16).substr(2, 8),
          username: userName,
          password: password,
        };
    
        const connectUrl = `${connectionOptions.protocol}://${connectionOptions.host}:${connectionOptions.port}${connectionOptions.endpoint}`;
        const mqttClient = mqtt.connect(connectUrl, connectionOptions);
    
        mqttClient.on("connect", () => {
          setConnecting(false);
          console.log("Connection succeeded!");
          mqttClient.subscribe(channelName, {qos: 1}, (error) => {
            if (error) {
              console.log('Error subscribing to topic:', error);
            } else {
              console.log(`Successfully subscribed to topic: ${channelName}`);
            }
          });
        });
    
        mqttClient.on("reconnect", () => {
          console.log("Reconnecting...");
          if (reconnectAttempts >= 5) {
            console.log("Max reconnect attempts reached. Stopping...");
            mqttClient.end();
          } else {
            setReconnectAttempts(reconnectAttempts + 1);
          }
        });
    
        mqttClient.on("error", (error) => {
          console.log("Connection failed", error);
        });
    
        setClient(mqttClient);
    }, []);
    return null;
};
