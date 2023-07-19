import React, {useEffect,useState,useContext} from "react";
import axios from "axios";
import { serverUrl } from "../../constant";
import {AuthContext} from "../../utils/AuthProvider";
import MqttConnector from "../../components/MqttConnector";
import { sortRides,distance } from "../../utils/rideForm";
import RideItem from "../../components/RideItem";
import { useNavigate } from "react-router-dom";

interface DriverAcceptOrderRequestProps {
    driverUid: string;
    longitude: string;
    latitude: string;
    numberPlate: string;
    vehicleInfo: string;
}

const Driver = () => {

    const [driver, setDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //get self location
    const [position, setPosition] = useState({latitude: 0, longitude: 0});
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
        }, (error) => {
            console.log(error);
        })
    }, [])

    //选择自己的province和city
    const [province, setProvince] = useState<string>("");
    const [city, setCity] = useState<string>("");

    //选择自己的车牌号和车型
    const [numberPlate, setNumberPlate] = useState<string>("");
    const [vehicleInfo, setVehicleInfo] = useState<string>("");

    const authContext = useContext(AuthContext);

    const onSubmit = async (e:any) => {
        e.preventDefault();
        if(!authContext) {
            throw new Error('AuthContext is null');
        }
        const {auth,setAuthToken} = authContext;
        axios.defaults.headers.common['x-auth-token'] = auth;
        try {
            const response = await axios.get(`${serverUrl}/user`);
            const user = response.data.data;
            user.carNumber= numberPlate;
            user.carType = vehicleInfo;
            user.province = province;
            user.city = city;
            const res = await axios.put(`${serverUrl}/user/${user.uid}`, user);
            setDriver(user);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    // accept order logic
    const handleOrder = async (rid:string) => {
        console.log(`trying to accept Order ${rid}.`);
        const driverAcceptOrderRequest: DriverAcceptOrderRequestProps = {
            driverUid: driver.uid,
            longitude: position.longitude.toString(),
            latitude: position.latitude.toString(),
            numberPlate: numberPlate,
            vehicleInfo: vehicleInfo
        }
        try {
            const res= await axios.put(`${serverUrl}/ride/${rid}`,driverAcceptOrderRequest);
            const channel = res.data.data;
            console.log("track channel: ",channel);
            // navigate to driver track page
            navigate(`/driver/${rid}/${channel}`);

        } catch (error) {
            console.log(error);
        }
    };

    // build up form
    const [form, setForm] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const formElement = sortRides(form,position.latitude,position.longitude).map((rideItem:any)=>{
        return <RideItem item={rideItem} handleOrder={handleOrder} key={rideItem.id} isLoading={isLoading}/>
    })

    useEffect(() => {
      setIsLoading(true);
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 50);
      return () => clearTimeout(timeoutId);
    }, [form]);

    return (
        <div style={{display:"flex", flexDirection:"column"}}>
            <h3>Your current Location:</h3>
            <div>
                <p>latitude: {position.latitude}</p>
                <p>longitude: {position.longitude}</p>
            </div>
            <h3>Choose the ride district to subscribe</h3>
            <form onSubmit={onSubmit}>
                <label>
                    Province:
                    <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} />
                </label>
                <label>
                    City:
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                </label>
                <label>
                    Number Plate:
                    <input type="text" value={numberPlate} onChange={(e) => setNumberPlate(e.target.value)} />
                </label>
                <label>
                    Vehicle Info:
                    <input type="text" value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} />
                </label>
                <input type="submit" value="Submit" />
            </form>
            <h3>Mqtt region</h3>
                {
                    loading ? <div>loading...</div> : 
                    <div>mqtt region:
                        <MqttConnector 
                            userName={driver.userName} 
                            password={driver.secretKey} 
                            topic={`ride-${driver.province}-${driver.city}`}
                            qos={2}
                            setForm={setForm}
                        />
                    </div>
                }
            <h3>Form</h3>
            {formElement}
        </div>
    )
}
export default Driver;