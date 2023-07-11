import exp from "constants";
import mqtt,{ MqttClient } from "mqtt";
import React,{useState,useEffect,useCallback} from "react";
import { useParams } from "react-router-dom";
import { ConnectionOptions, serverUrl } from "../../constant";
import { Position } from "../../constant";
import Map from "../../components/Map";
import axios from "axios";
import '../../App.scss'


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
    const [speed, setSpeed] = useState(0);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    //connecting to mqtt broker
    connectionOptions.username = "track-"+rid;
    connectionOptions.password = rid+Math.random().toString(16).substr(2, 8);
    const connectUrl = `${connectionOptions.protocol}://${connectionOptions.host}:${connectionOptions.port}${connectionOptions.endpoint}`;

    const mqttConnection = useCallback((connectUrl:string,connectionOptions:ConnectionOptions,channelName:string) => {
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
    },[])

    const receivePassengerPosition = useCallback((topic:string,message:Buffer) => {
        console.log(`Received message on ${topic}: ${message.toString()}`);
        const msgData = JSON.parse(message.toString());
        console.log("msgData: ",msgData);
        if(msgData.user==="Driver") {
            console.log("Driver");
            return;
        }
        setPassengerPosition({ lat: msgData.lat, lng: msgData.lng });
        setRideStatus(msgData.action);
    },[])

    useEffect(() => {
        setConnecting(true);
        const mqttClient = mqttConnection(connectUrl,connectionOptions,channelName);
        mqttClient.on('message', receivePassengerPosition);
        setClient(mqttClient);
        console.log("mqttClient: ",mqttClient);
        console.log("reconncting time: ",reconnectAttempts);

        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])


    //rideStatus
    const [rideStatus,setRideStatus] = useState("");

    //get driver current position
    const getDriverPosition = useCallback(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const currentPosition : Position= { lat: latitude, lng: longitude };
            setDriverPosition(currentPosition);

            if(startPosition === null) { startPosition = currentPosition;}
            const message = {
                user:"Driver",
                lat: latitude,
                lng: longitude,
                action:rideStatus,
                rid:rid,
            }
            client!.publish(channelName, JSON.stringify(message));
        },
        (error) => {
            console.log('Geolocation Error: ', error);
        })
    },[client])


    useEffect(() => {
        let interval:any;
        if(client) {
            interval = setInterval(() => {
                getDriverPosition();
            }, 5000)
        } else {
            console.log("client is not ready, cannot get driver location");
        }
        return () => {
            clearInterval(interval);
        }
    },[client])


    const pickUpPassengerHandler = useCallback (async () => {
        setRideStatus("PickedUpPassenger")
        client!.removeListener('message', receivePassengerPosition);
        console.log("pickedup passenger ");
        // get the destination of the ride
        try {
            const response = await axios(`${serverUrl}/ride/${rid}?lat=0.00&long=0.00`);
            const destination =response.data.data.ride.endPointCoordinates;
            console.log("destination: ",destination);
            const arr = destination.split(",");
            const message = {
                user:"Driver",
                lat: parseFloat(arr[0]),
                lng: parseFloat(arr[1]),
                action:"PickedUpPassenger",
                rid:rid,
            }
            setPassengerPosition({ lat: parseFloat(arr[0]), lng: parseFloat(arr[1]) });
            client!.publish(channelName, JSON.stringify(message));

        } catch (error) {
            console.log(error);
        }
    },[client])

    return (
        <div className="full">
            <div>
                <button onClick={pickUpPassengerHandler}>pick up passenger</button>
            </div>
            <Map start={driverPosition} end={passengerPosition}></Map>
        </div>
    )
}

export default DriverTracking;


