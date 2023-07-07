import React, { useEffect, useState,useContext } from "react";
import axios from "axios";
import { Identity, serverUrl } from "../../constant";
import { AuthContext } from "../../utils/AuthProvider";

const CreateRide = () => {
    // a form if create a ride
    const [uid, setUid] = useState("");
    const [pickUpLong, setPickUpLong] = useState("");
    const [pickUpLat, setPickUpLat] = useState("");
    const [desResolvedAddress, setDesResolvedAddress] = useState("");
    const [type,setType] = useState("Economy"); //   Economy,Comfort,Luxury
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(true); // New loading state

    const authContext = useContext(AuthContext); // Get the AuthContext

    useEffect(() => {
        if(!authContext) {return;}
        axios.defaults.headers.common["x-auth-token"] = authContext.auth;
        console.log("axios header: " + axios.defaults.headers.common["x-auth-token"])
    },[])

    const getUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${serverUrl}/user`);
            setUid(response.data.data.uid);
            setLoading(false); // Set loading to false after data is fetched
            return response.data.data;
        } catch (error : any) {
            console.log(error.message);
            setLoading(false); 
        }
    };

    // Call getUser when the component mounts
    useEffect(() => {
        getUser();
    }, []); 

    const handleSubmit = async (e : any) => {
        e.preventDefault();

        const ride = {
            uid: uid,
            pickUpLong,
            pickUpLat,
            pickUpResolvedAddress:pickUpLong+","+pickUpLat,
            desResolvedAddress,
            type,
            province,
            city,
        };

        try {
            console.log(JSON.stringify(ride));

            const response = await axios.post(`${serverUrl}/ride`, ride);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Render a loading indicator if data is still being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // Render the form once the data is available
    return (
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column"}}>
            <label>Pick Up Longitude: </label>
            <input type="text" value={pickUpLong} onChange={(e) => setPickUpLong(e.target.value)} />
            <label>Pick Up Latitude: </label>
            <input type="text" value={pickUpLat} onChange={(e) => setPickUpLat(e.target.value)} />
            <label>Destination Resolved Address: </label>
            <input type="text" value={desResolvedAddress} onChange={(e) => setDesResolvedAddress(e.target.value)} />
            <label>Type: </label>
            <select value={type} onChange={(e)=>{setType(e.target.value)}}>
                <option value="Economy">Economy</option>
                <option value="Comfort">Comfort</option>
                <option value="Luxury">Luxury</option>
            </select>
            <label>Province: </label>
            <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} />
            <label>City: </label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            <button type="submit">Submit</button>
        </form>
    )
}

export default CreateRide;
