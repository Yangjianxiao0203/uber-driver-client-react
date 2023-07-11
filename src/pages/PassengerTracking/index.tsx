import { useParams } from "react-router-dom"
import { useState,useEffect } from "react"
import { ConnectionOptions,Position } from "../../constant"
import mqtt,{ MqttClient } from "mqtt"
import Map from "../../components/Map"

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

const PassengerTracking: React.FC = () => {
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
    connectionOptions.username = "track-"+rid+"passenger";
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
        mqttClient.on('message', function (topic, message) {
            const msgData = JSON.parse(message.toString());
            console.log("msgData: ",msgData);
            setDriverPosition({ lat: msgData.lat, lng: msgData.lng });
            setRideStatus(msgData.action);
        });

        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])

    //rideStatus
    const [rideStatus,setRideStatus] = useState("");

    //get driver current position
    const getPassengerPosition = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const currentPosition : Position= { lat: latitude-0.1, lng: longitude-0.1 };
            setPassengerPosition(currentPosition);
            const message = {
                lat: currentPosition.lat,
                lng: currentPosition.lng,
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
                getPassengerPosition();
            }, 2000)
        } else {
            console.log("client is not ready, cannot get driver location");
        }
        return () => {
            clearInterval(interval);
        }
    },[client])

    // google map
    // useEffect(()=>{
    //     console.log("driverPosition: ",driverPosition);
    //     console.log("passengerPosition: ",passengerPosition);
    // },[
    //     driverPosition,passengerPosition
    // ])

    return (
        <div>
            <Map start={driverPosition} end={passengerPosition}></Map>
        </div>
    )
}

export default PassengerTracking