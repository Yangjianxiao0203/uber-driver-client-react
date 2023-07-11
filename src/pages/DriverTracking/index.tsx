import exp from "constants";
import mqtt,{ MqttClient } from "mqtt";
import React,{useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import { ConnectionOptions } from "../../constant";
import { Position } from "../../constant";
import GoogleMap from "../GoogleMap";
import GoogleMapReact from 'google-map-react';

const connectionOptions: ConnectionOptions = {
    protocol: "ws",
    host: "localhost",
    port: 8083,
    endpoint: "/mqtt",
    clean: false,
    connectTimeout: 10000,
    reconnectPeriod: 4000,
    clientId: "track" + Math.random().toString(16).substr(2, 8),
    username: "",
    password: "",
}

var startPosition:Position | null =null;

const Marker = ({ text }:any) => <div>{text}</div>;

const DriverTracking = () => {

    const {rid,channelName} = useParams<{rid:string, channelName:string}>();
    if(rid===undefined || channelName === undefined) {
        throw new Error("rid or channelName is undefined");
    }

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [ride, setRide] = useState<any>(null);
    const [driverPosition, setDriverPosition] = useState<Position>({ lat: 0, lng: 0});
    const [passengerPosition, setPassengerPosition] = useState<Position>({ lat: 0, lng: 0});
    const [pathCoordinates, setPathCoordinates] = useState<Position[]>([]);
    const [speed, setSpeed] = useState(0);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    //connecting to mqtt broker
    connectionOptions.username = "track-"+rid;
    connectionOptions.password = rid+Math.random().toString(16).substr(2, 8);
    const connectUrl = `${connectionOptions.protocol}://${connectionOptions.host}:${connectionOptions.port}${connectionOptions.endpoint}`;

    const mqttConnection = (connectUrl:string,connectionOptions:ConnectionOptions,channelName:string) => {
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
        return mqttClient;
    }
    useEffect(() => {
        setConnecting(true);
        const mqttClient = mqttConnection(connectUrl,connectionOptions,channelName);
        setClient(mqttClient);
        console.log("mqttClient: ",mqttClient);
        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])

    //rideStatus
    const [rideStatus,setRideStatus] = useState("");

    //get driver current position
    const getDriverPosition = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const currentPosition : Position= { lat: latitude, lng: longitude };
            setDriverPosition(currentPosition);
            if(startPosition === null) { startPosition = currentPosition;}
            const message = {
                lat: latitude,
                lng: longitude,
                action:rideStatus
            }
            client!.publish(channelName, JSON.stringify(message));
        },
        (error) => {
            console.log('Geolocation Error: ', error);
        })
    }
    useEffect(() => {
        let interval:any;
        if(client) {
            interval = setInterval(() => {
                getDriverPosition();
            }, 2000)
        } else {
            console.log("client is not ready, cannot get driver location");
        }
        return () => {
            clearInterval(interval);
        }
    },[client])

    // google map
    //https://www.youtube.com/watch?v=2po9_CIRW7I

    return (
        <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyAHlGuFEKxf_fu8QdgeTObUHqkFRLAMfpM' }} // replace with your Google Maps API key
            defaultCenter={startPosition? startPosition : {lat: 10, lng: 10}}
            defaultZoom={10}
        >
            <Marker
                lat={driverPosition.lat}
                lng={driverPosition.lng}
                text="Driver"
            />
            <Marker
                lat={passengerPosition.lat}
                lng={passengerPosition.lng}
                text="Passenger"
            />
        </GoogleMapReact>
    </div>
    )
}

export default DriverTracking;
