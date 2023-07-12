import mqtt,{ MqttClient } from "mqtt";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConnectionOptions, Position, serverUrl } from "../../constant";
import Map from "../../components/Map";
import axios from "axios";

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

const PassengerTrackOnRide = () => {
    const {rid,channelName} = useParams<{rid:string, channelName:string}>();
    if(rid===undefined || channelName === undefined) {
        throw new Error("rid or channelName is undefined");
    }

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [start , setStart] = useState<Position | undefined>();
    const [end , setEnd] = useState<Position | undefined>();

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

    //get current driver path
    useEffect(() => {
        setConnecting(true);
        const mqttClient = mqttConnection(connectUrl,connectionOptions,channelName);
        setClient(mqttClient);
        console.log("mqttClient: ",mqttClient);

        mqttClient.on('message', function (topic, message) {
            const msgData = JSON.parse(message.toString());
            if(msgData.user==="Passenger") {
                return;
            }
            setStart({ lat:msgData.lat, lng:msgData.lng});
        });

        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])


    //get destination
    useEffect(() => {
        axios.get(`${serverUrl}/ride/${rid}?lat=0&long=0`).then((res) => {
            return res.data.data.ride;
        }).then((ride) => {
            const destination = ride.endPointCoordinates.split(",");
            setEnd({lat:parseFloat(destination[0]),lng:parseFloat(destination[1])});
        }).
        catch((err) => {
            console.log("err: ",err);
        });
    },[])


    return (
        <div className="full">
            <Map start={start} end={end}></Map>
        </div>
    )
}
export default PassengerTrackOnRide;