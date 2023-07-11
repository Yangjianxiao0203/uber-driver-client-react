// LocationManager.js
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
interface Position {
    lat: number;
    lng: number;
}

interface LocationManagerProps {
    client: MqttClient | null;
    channelName: string;
    setDriverPosition: React.Dispatch<React.SetStateAction<Position>>;
    setPassengerPosition: React.Dispatch<React.SetStateAction<Position>>;
    setPathCoordinates: React.Dispatch<React.SetStateAction<Position[]>>;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
    client,
    channelName,
    setDriverPosition,
    setPassengerPosition,
    setPathCoordinates,
}) => {
    const [rideStatus, setRideStatus] = useState("");

    const sendLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            if(client) {
                const message = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    action: rideStatus
                };
                setDriverPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                client.publish(channelName, JSON.stringify(message));
                console.log("driver set current position: ",{lat: position.coords.latitude,lng: position.coords.longitude})
            }
        });
    }

    useEffect(() => {
        if(client) {
            client.on("message", (channelName, message) => {
                const messageData = JSON.parse(message.toString());
                if (messageData.action === '' && rideStatus === '') {
                    setPassengerPosition({
                        lat: messageData.lat,
                        lng: messageData.lng
                    });
                } else  {
                    setRideStatus(messageData.action);
                }
            });
        }

        if (rideStatus === 'DriverAccepted' || rideStatus === 'PickedUpPassenger') {
            const sendLocationInterval = setInterval(sendLocation, 2000);
            return () => {
                clearInterval(sendLocationInterval);
            }
        } else {
            return () => {};
        }
    }, [client, rideStatus]);

    return null;
};

export default LocationManager;
