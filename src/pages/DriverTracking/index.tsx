/* eslint-disable @typescript-eslint/no-unused-vars */
import exp from "constants";
import mqtt,{ MqttClient } from "mqtt";
import React,{useState,useEffect,useCallback} from "react";
import { useParams } from "react-router-dom";
import { ConnectionOptions, serverUrl } from "../../constant";
import { Position } from "../../constant";
import Map from "../../components/Map";
import axios from "axios";
import '../../App.scss'
import { useNavigate } from "react-router-dom";


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
    const navigate = useNavigate();

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
        const msgData = JSON.parse(message.toString());
        if(msgData.user==="Driver") {
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

        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])


    //rideStatus
    const [rideStatus,setRideStatus] = useState("");

    //get driver current position
    const getDriverPosition = useCallback(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude,speed } = position.coords;
            const currentPosition : Position= { lat: latitude, lng: longitude };
            setDriverPosition(currentPosition);
            if(speed!=null) {
                setSpeed(speed+10); // beacuse my phone is not moving
            } else {
                setSpeed(10);
            }
            if(startPosition === null) { startPosition = currentPosition;}
            const message = {
                user:"Driver",
                lat: latitude,
                lng: longitude,
                action:rideStatus,
                rid:rid,
                speed:speed
            }
            client!.publish(channelName, JSON.stringify(message));
        },
        (error) => {
            console.log('Geolocation Error: ', error);
        })
    },[client])

    // get driver position and send out every 5 seconds
    useEffect(() => {
        let interval:any;
        console.log("rideStatus: ",rideStatus);
        if(client&& rideStatus!=="Arrived") {
            console.log("start time clicker for get driver position")
            interval = setInterval(() => {
                getDriverPosition();
            }, 5000)
        } else {
            console.log("client is not ready, cannot get driver location");
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        }
    },[client,rideStatus])

    // when driver click the button, send out the picked up message
    const pickUpPassengerHandler = useCallback (async () => {
        setRideStatus("PickedUpPassenger")
        client!.removeListener('message', receivePassengerPosition);
        console.log("pickedup passenger ");
        // get the destination of the ride
        try {
            const response = await axios(`${serverUrl}/ride/${rid}?lat=0.00&long=0.00`);
            console.log("response: ",response);
            const destination =response.data.data.ride.endPointCoordinates;
            console.log("destination: ",destination);
            const arr = destination.split(",");
            const message = {
                user:"Driver",
                lat: parseFloat(arr[0]),
                lng: parseFloat(arr[1]),
                action:"PickedUpPassenger",
                rid:rid,
                speed:speed
            }
            setPassengerPosition({ lat: parseFloat(arr[0]), lng: parseFloat(arr[1]) });
            client!.publish(channelName, JSON.stringify(message));

        } catch (error) {
            console.log(error);
        }
    },[client])

    //if speed >0, then set status to onRide
    useEffect(() => {
        if(speed>0 && rideStatus==="PickedUpPassenger") {
            setRideStatus("OnRide");
            const message = {
                user:"Driver",
                lat: driverPosition.lat,
                lng: driverPosition.lng,
                action:"OnRide",
                rid:rid,
                speed:speed
            }
            client!.publish(channelName, JSON.stringify(message));
        }
        if(rideStatus === 'Arrived') {
            navigate(`/driver`);
        }
    },[speed,rideStatus])

    useEffect(() => {
        console.log("speed: ",speed);
    },[speed])

    //when driver arrived
    const arrivedHandler = useCallback(async () => {
        const message = {
            user:"Driver",
            lat: driverPosition.lat,
            lng: driverPosition.lng,
            action:"Arrived",
            rid:rid,
            speed:speed
        }
        console.log("arrived message", message);
        client!.publish(channelName, JSON.stringify(message));
        setRideStatus("Arrived");
    },[client,driverPosition])

    return (
        <div className="full">
            <div style={{display:"flex",flexDirection:"row"}}>
                <button onClick={pickUpPassengerHandler}>pick up passenger</button>
                <button onClick={arrivedHandler} style={{marginLeft:20}}>Arrived</button>
            </div>
            <Map start={driverPosition} end={passengerPosition}></Map>
        </div>
    )
}

export default DriverTracking;


