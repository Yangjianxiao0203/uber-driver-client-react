import './styles.scss'
import { useContext } from 'react';
import axios from 'axios';
import { useEffect,useState } from 'react';
import { serverUrl } from '../../constant';
import { AuthContext } from '../../utils/AuthProvider';
import { useNavigate } from 'react-router-dom';


var interval: string | number | NodeJS.Timeout | undefined;
const PassengerWaitingPage = () => {

    const [rides,setRides] = useState<any[]>([])
    const [isTracking,setIsTracking] = useState<boolean>(false)
    const navigate = useNavigate()
    const {auth} = useContext(AuthContext)

    useEffect(()=>{
        console.log(rides)
    },[rides])

    useEffect(()=>{
        axios.defaults.headers.common["x-auth-token"] = auth;
        interval = setInterval(()=>{
            axios.get(`${serverUrl}/ride/accepted`)
            .then(res=>{
                const ridesBackend = res.data.data
                setRides(ridesBackend)
            })
            .catch(err=>{
                console.log(err)
            })
        },2000)
        if(!isTracking) {clearInterval(interval)};
        return () => clearInterval(interval)
    },[isTracking])

    const getTrackChannel = async (rideId:string) => {
        try {
            const res = await axios.get(`${serverUrl}/ride/track/${rideId}`);
            const channelName = res.data.data;
            console.log("channelName: " + channelName);
            return channelName;
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
                    </div>);
                })
            }
        </div>
    )
}
export default PassengerWaitingPage