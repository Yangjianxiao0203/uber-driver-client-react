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
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(true); // New loading state

    const authContext = useContext(AuthContext); // Get the AuthContext

    // Use an effect to set the token when the component mounts
    useEffect(() => {
        if (authContext && authContext.auth) {
            authContext.setAuthToken(authContext.auth);
            console.log(authContext.auth);
        }
    }, [authContext]);

    const getUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${serverUrl}/user`);
            setUid(response.data.data.uid);
            setLoading(false); // Set loading to false after data is fetched
            return response.data.data;
        } catch (error : any) {
            console.log(error.message);
            setLoading(false); // Also set loading to false in case of error
        }
    };

    // Call getUser when the component mounts
    useEffect(() => {
        getUser();
    }, []); // Pass an empty dependency array to run this effect once on mount

    const handleSubmit = async (e : any) => {
        e.preventDefault();

        const ride = {
            uid: uid,
            pickUpLong,
            pickUpLat,
            pickUpResolvedAddress:pickUpLong+pickUpLat,
            desResolvedAddress,
            type: Identity.Passenger,
            province,
            city,
        };

        try {
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
            <label>Province: </label>
            <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} />
            <label>City: </label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            <button type="submit">Submit</button>
        </form>
    )
}

export default CreateRide;
