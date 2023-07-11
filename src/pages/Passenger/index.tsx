import React, {useEffect, useState} from "react";
import axios from "axios";
import CreateRide from "../../components/CreateRide";
import { serverUrl } from "../../constant";

const Passenger = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [rides, setRides] = useState<any>([]);
    const [fetchSuccess, setFetchSuccess] = useState(false);

    const fetchRidesAccepted = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${serverUrl}/ride/accepted`);
            console.log("accepted response: " + response);
            const rides = response.data.data;
            setRides(rides);
            setIsLoading(false);
            setFetchSuccess(true);
            console.log("fetch rides success");
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    // fetch ride every 5 seconds
    useEffect(()=>{
        const interval = setInterval(()=>{
            if(fetchSuccess) {
                clearInterval(interval);
                return;
            }
            fetchRidesAccepted();
        }, 5000);
        return () => clearInterval(interval);
    },[fetchSuccess])

    return (
        <>
            <h3>Create ride</h3>
            <CreateRide />
            <h3>accepted order</h3>
            {
                isLoading ? <p>loading...</p> : rides.map((item:any) => {
                    return (
                        <div key={"ride"+item.id} style={{marginLeft:"20"}}>
                            <h4>*********Ride #{item.id}**********</h4>
                            <p>Starting point: {item.startPointAddress}</p>
                            <p>Ending point: {item.endPointAddress}</p>
                            <p>Estimated ride length: {item.rideLength}</p>
                            <p>Driver: {item.driverUid}</p>
                        </div>
                    )
                })
            }
        </>
    )
}
export default Passenger;