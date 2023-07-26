import { useNavigate, useParams } from "react-router-dom"
import { useState,useEffect, useCallback, useContext } from "react"
import { ConnectionOptions,Position, serverUrl } from "../../constant"
import mqtt,{ MqttClient } from "mqtt"
import Map from "../../components/Map"
import '../../App.scss'
import { getUser } from "../../utils/getUser"
import { AuthContext } from "../../utils/AuthProvider"
import axios from "axios"
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

var user:any=null;
var cancelBySelf:boolean = false;
const PassengerTracking: React.FC = () => {
    const {rid,channelName} = useParams<{rid:string, channelName:string}>();
    if(rid===undefined || channelName === undefined) {
        throw new Error("rid or channelName is undefined");
    }

    const [client, setClient] = useState<MqttClient | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [driverPosition, setDriverPosition] = useState<Position>({ lat: 0, lng: 0});
    const [passengerPosition, setPassengerPosition] = useState<Position>({ lat: 0, lng: 0});
    const [speed, setSpeed] = useState(0);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const {auth} = useContext(AuthContext);
    const navigate = useNavigate();

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
            console.log(msgData);
            if(msgData.user==="Passenger") {
                return;
            } else if(msgData.user==null) {
                console.log("cancelBySelf: ",cancelBySelf);
                if(!cancelBySelf) {
                    console.log("ride has been cancelled by driver");
                    navigate("/passenger/waiting");
                    return ;
                }
            }
            if( msgData.action!=="") {
                // navigate to following page
                navigate("/passenger/track/onRide/"+rid+"/"+channelName);
            }
            setDriverPosition({ lat: msgData.lat, lng: msgData.lng });
        });

        return () => {
            mqttClient.end();
        }
    },[reconnectAttempts])

    //get driver current position
    const getPassengerPosition = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude, speed } = position.coords;
            const currentPosition : Position= { lat: latitude-0.1, lng: longitude-0.1 };
            setPassengerPosition(currentPosition);
            const message = {
                user:"Passenger",
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                action:"",
                rid:rid,
                speed:speed
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
            }, 5000)
        } else {
            console.log("client is null or rideStatus is changed");
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        }
    },[client])

    //cancel button
    const cancelHandler = useCallback(async (rideId:string) => {
        try {
            cancelBySelf = true;
            if(user==null) {
                user= await getUser(auth);
            }
            const request = {
                uid: user.uid,
                cancel:true
            }
            const res = await axios.put(`${serverUrl}/ride/cancel/${rideId}`,request);
            const status = res.data.status;
            if(status === '0') {
                console.log("cancel success");
                navigate(`/passenger/createRide`);
            } else {
                alert("cancel failed, please try again");
            }
        } catch (error) {
            console.log(error);
            cancelBySelf = false;
        }
    },[])

    return (
        <div className="full">
            <button onClick={()=>cancelHandler(rid)}>cancel</button>
            <Map start={driverPosition} end={passengerPosition}></Map>
        </div>
    )
}

export default PassengerTracking