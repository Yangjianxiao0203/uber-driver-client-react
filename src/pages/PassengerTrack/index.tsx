// PassengerTrack.js
import React, { useState } from "react";
import { MqttClient } from "mqtt";
import GoogleMap from "../GoogleMap";
import { ConnectionManager } from "./ConnectionManager";
import { PassengerLocationManager } from "./PassengerLocationManager";
import { PassengerRideManager } from "./PassengerRideManager";

interface Position {
    lat: number;
    lng: number;
}

interface PassengerTrackProps {
    userName: string;
    password: string;
    rid: string;
    channelName: string;
}

const PassengerTrack: React.FC<PassengerTrackProps> = ({userName,password,rid,channelName}) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);

    const [ride, setRide] = useState<any>(null);
    const [driverPosition, setDriverPosition] = useState<Position>({ lat: 0, lng: 0});

    return (
        <div>
            <ConnectionManager
                userName={userName}
                password={password}
                channelName={channelName}
                setClient={setClient}
                setConnecting={setConnecting}
            />

            <PassengerLocationManager
                client={client}
                channelName={channelName}
                setDriverPosition={setDriverPosition}
            />

            <PassengerRideManager
                rid={rid}
                setRide={setRide}
            />

            {connecting ? (
                <div>Connecting...</div>
            ):(
                <>
                    <GoogleMap
                            currentPosition={driverPosition}
                            endPosition={null}
                            pathCoordinates={[]} 
                            startPosition={null}                    />
                </>
            )}
        </div>
    );
}

export default PassengerTrack;
