// PassengerRideManager.js
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../constant/index";

interface PassengerRideManagerProps {
    rid: string;
    setRide: React.Dispatch<React.SetStateAction<any>>;
}

export const PassengerRideManager: React.FC<PassengerRideManagerProps> = ({ rid, setRide }) => {
    const fetchRideInfo = async () => {
        try{
            const res = await axios.get(`${serverUrl}/ride/${rid}`);
            const ride= res.data.ride;
            setRide(ride);
            console.log("fetch ride info success");
        }catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        const rideInfoInterval = setInterval(fetchRideInfo, 5000);
        return () => {
            clearInterval(rideInfoInterval);
        };
    }, []);

    return null;
};
