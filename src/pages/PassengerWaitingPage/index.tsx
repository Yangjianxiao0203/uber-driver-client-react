import './styles.scss'
import { useContext } from 'react';
import axios from 'axios';
import { useEffect,useState } from 'react';
import { serverUrl } from '../../constant';
import { AuthContext } from '../../utils/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/getUser';

var interval: string | number | NodeJS.Timeout | undefined;
var user:any  =null;
const PassengerWaitingPage = () => {

    const [rides,setRides] = useState<any[]>([])
    const [isTracking,setIsTracking] = useState<boolean>(false)
    const navigate = useNavigate()
    const {auth} = useContext(AuthContext)

    useEffect(()=>{
        console.log(rides)
    },[rides])

    const getRides = async () => {
        try {
            const res = await axios.get(`${serverUrl}/ride/accepted`);
            const ridesBackend = res.data.data;
            setRides(ridesBackend);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        axios.defaults.headers.common["x-auth-token"] = auth;
        interval = setInterval(()=>{
            getRides();
        },2000)
        if(!isTracking) {clearInterval(interval)};
        return () => clearInterval(interval)
    },[isTracking])

    const getTrackChannel = async (rideId:string) => {
        try {
            const res = await axios.get(`${serverUrl}/ride/track/${rideId}`);
            const channelName = res.data.data;
            return channelName;
        } catch (error) {
            console.log(error);
        }
    }

    const cancelRide = async (rideId:string) => {
        try {
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
                getRides();
            } else {
                alert("cancel failed, please try again");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            {!isTracking && <button onClick={()=>{setIsTracking(true)}}>Start tracking</button>}
            {isTracking && <button onClick={()=>{setIsTracking(false)}}>Stop tracking</button>}
            {
                rides.map((item,index)=>{
                  return (
                    <div key={index}>
                            <h4>*********Ride #{item.id}**********</h4>
                            <p>Starting point: {item.startPointAddress}</p>
                            <p>Ending point: {item.endPointAddress}</p>
                            <p>Estimated ride length: {item.rideLength}</p>
                            <p>Driver: {item.driverUid}</p>
                            <button onClick={()=>getTrackChannel(item.id).then((channelName)=> navigate(`/passenger/${item.id}/${channelName}`))}>Tracking</button>
                            <button onClick={()=>cancelRide(item.id)}>cancel</button>
                    </div>);
                })
            }
        </div>
    )
}
export default PassengerWaitingPage