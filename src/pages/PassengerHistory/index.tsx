import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../utils/AuthProvider";
import { getUser } from "../../utils/getUser";
import axios from "axios";
import { serverUrl } from "../../constant";

var user:any = null
const PassengerHistory = () => {
    const {auth} = useContext(AuthContext);
    const [rides,setRides] = useState<any>([])
    const [infos,setInfos] = useState<any[]>([])

    useEffect(()=>{
        getUser(auth).then((res)=>{
            user=res
        }).then(()=>{
            //get all rides
            axios.get(`${serverUrl}/ride?uid=${user.uid}`).then((res)=>{
                setRides(res.data.data)
            })
        }).catch((err)=>{
            console.log(err)
        })
    },[])

    //get conresponding driver info
    const getDriverAndOrder = async (rid:string) => {
        const response = await axios.get(`${serverUrl}/user/driver?rid=${rid}`)
        const driver = response.data.data
        const orderResponse = await axios.get(`${serverUrl}/order?rid=${rid}`)
        const order = orderResponse.data.data

        return {driver,order}
    }

    useEffect(()=>{
        const promises = rides.map((ride:any)=>{
            return getDriverAndOrder(ride.id).then((res)=>{
                setInfos((pre)=>{
                    return [...pre,{
                        driver:res.driver,
                        order:res.order,
                        ride:ride
                    }]
                })
            })
        })
        // Promise.all(promises).then(()=>{console.log(infos)})
        return ()=>{
            setInfos([])
        }
    },[rides])

    useEffect(()=>{
        console.log(infos)
    },[infos])

    return (
        <div style={{display:"flex",flexDirection:"column"}}>
            {infos.sort((a, b) => new Date(b.ride.creationTime).getTime() - new Date(a.ride.creationTime).getTime()).map(({driver,ride,order},index)=>{
                return (
                    <div id={"ride"+index+ride.id} style={{marginTop:20}}>
                        <h2>*************************************</h2>
                        <h3>Ride Creation Time: {new Date(ride.creationTime).toISOString().replace('T', ' ').substring(0, 19)}</h3>
                        <h4>Ride Status: {ride.status}</h4>
                        <h5>Ride Start Address: {ride.startPointAddress}</h5>
                        <h5>Ride End Address: {ride.endPointAddress}</h5>
                        <h5>total cost: {order.totalCost}$</h5>
                        <h5>Driver id: {driver.uid}</h5>
                        <h5>Driver name: {driver.userName}</h5>
                        <h5>Driver phone: {driver.phoneNumber}</h5>
                        <h5>Driver car number: {driver.carNumber}</h5>
                        <h5>Driver car type: {driver.carType}</h5>
                    </div>
                )
            })}
        </div>
    )
}
export default PassengerHistory;