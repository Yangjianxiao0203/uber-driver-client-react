// PassengerLocationManager.js
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
interface Position {
    lat: number;
    lng: number;
}
interface PassengerLocationManagerProps {
    client: MqttClient | null;
    channelName: string;
    setDriverPosition: React.Dispatch<React.SetStateAction<Position>>;
}

export const PassengerLocationManager: React.FC<PassengerLocationManagerProps> = ({
    client,
    channelName,
    setDriverPosition,
}) => {
    useEffect(() => {
        if(client) {
            client.on("message", (channelName, message) => {
                const messageData = JSON.parse(message.toString());
                setDriverPosition({
                    lat: messageData.lat,
                    lng: messageData.lng
                });
            });
        }
    }, [client]);

    return null;
};
