// DriverTrack.js
import React, { useState } from "react";
import { MqttClient } from "mqtt";
import GoogleMap from "../GoogleMap";
import { ConnectionManager } from "./ConnectionManager";
import {LocationManager} from "./LocationManager";
import { RideManager } from "./RideManager";
import { TrackProps } from "../../constant";

interface Position {
    lat: number;
    lng: number;
}

interface DriverTrackProps {
    userName: string;
    password: string;
    rid: string;
    channelName: string;
}

const DriverTrack: React.FC<DriverTrackProps> = ({userName,password,rid,channelName}) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [ride, setRide] = useState<any>(null);
    const [driverPosition, setDriverPosition] = useState<Position>({ lat: 0, lng: 0});
    const [passengerPosition, setPassengerPosition] = useState<Position>({ lat: 0, lng: 0});
    const [pathCoordinates, setPathCoordinates] = useState<Position[]>([]);
    const [speed, setSpeed] = useState(0);

    const handleClickPickedUpPassenger = () => {
        if(client) {
            const message:TrackProps = {
                action: 'PickedUpPassenger',
                lat: driverPosition.lat.toString(),
                long: driverPosition.lng.toString(),
                user:"driver",
                speed: speed.toString()
            };
            client.publish(channelName, JSON.stringify(message));
        }
    }

    const handleClickArrived = () => {
        if(client) {
            const message = {
                action: 'Arrived',
                lat: driverPosition.lat.toString(),
                long: driverPosition.lng.toString(),
                user:"driver",
                speed: speed.toString()
            };
            client.publish(channelName, JSON.stringify(message));
        }
    }

    return (
        <div>
            <ConnectionManager
                userName={userName}
                password={password}
                channelName={channelName}
                setClient={setClient}
                setConnecting={setConnecting}
            />

            <LocationManager
                client={client}
                channelName={channelName}
                setDriverPosition={setDriverPosition}
                setPassengerPosition={setPassengerPosition}
                setPathCoordinates={setPathCoordinates}
            />

            <RideManager
                rid={rid}
                setRide={setRide}
            />

            {connecting ? (
                <div>Connecting...</div>
            ) : (
                <>
                    <div>
                        <button onClick={handleClickPickedUpPassenger}>Picked up passenger</button>
                        <button onClick={handleClickArrived}>Arrived</button>
                    </div>
                    <GoogleMap
                                currentPosition={driverPosition}
                                endPosition={passengerPosition}
                                pathCoordinates={pathCoordinates} 
                                startPosition={null}                    />
                </>
            )}
            </div>
            );
}

export default DriverTrack;
