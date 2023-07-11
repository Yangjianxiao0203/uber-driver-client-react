// RideManager.js
import { useEffect, useState } from "react";
import axios from "axios";
import { Position, serverUrl } from "../../constant/index";

interface RideManagerProps {
    rid: string;
    setRide: React.Dispatch<React.SetStateAction<any>>;
    position: Position;
}

export const RideManager: React.FC<RideManagerProps> = ({ rid, setRide,position }) => {
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [fetchAttempts, setFetchAttempts] = useState(0);

    const fetchRideInfo = async () => {
        try{
            //?lat=0.00&long=0.00
            const res = await axios.get(`${serverUrl}/ride/${rid}?lat=${position.lat}&long=${position.lng}`);
            console.log("fetch ride info success");
            const ride= res.data.data.ride;
            setRide(ride);
            console.log("ride: ",ride)
            setFetchSuccess(true);  
        }catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        // const rideInfoInterval = setInterval(() => {
        //     if (!fetchSuccess && fetchAttempts < 5) {
        //         fetchRideInfo();
        //         setFetchAttempts(fetchAttempts + 1);
        //     } else {
        //         clearInterval(rideInfoInterval);
        //     }
        // }, 5000);
        // return () => {
        //     clearInterval(rideInfoInterval);
        // };
        fetchRideInfo();
    }, [fetchSuccess, fetchAttempts]);

    return null;
};

export default RideManager;