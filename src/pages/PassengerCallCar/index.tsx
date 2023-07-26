import SelectableMap from '../../components/SelectableMap'
import { useState,useEffect, FormEvent, useMemo,useContext } from 'react'
import axios from 'axios'
import { OrderCreationRequestProps, serverUrl } from '../../constant'
import './styles.scss'
import { AuthContext } from '../../utils/AuthProvider'
import { useNavigate } from 'react-router-dom'

const PassengerCallCar = () => {

    const [start,setStart] = useState<google.maps.LatLngLiteral>()
    const [end,setEnd] = useState<google.maps.LatLngLiteral>()
    const [rideType,setRideType] = useState<'Economy' | 'Comfort' | 'Luxury'>('Economy')
    const {auth} = useContext(AuthContext)
    const navigate = useNavigate()

    const createRide = useMemo<OrderCreationRequestProps>(() => {
        return {
            uid:undefined,
            pickUpLong:start?.lng?.toString(),
            pickUpLat:start?.lat?.toString(),
            pickUpResolvedAddress:undefined,
            desLong:end?.lng?.toString(),
            desLat:end?.lat?.toString(),
            desResolvedAddress:undefined,
            rideLength:undefined,
            type: rideType,
            province:undefined,
            city:undefined
        }
    },[])


    const submitHandler = async (e:FormEvent) => {
        e.preventDefault()
        console.log("ride: ",createRide)
        const res = await axios.post(`${serverUrl}/ride`,createRide)
        // if it is successful, redirect to the waiting page
        console.log(res.data)
        if(res.data.status==='0') {
            console.log(res.data.message)
            navigate(`/passenger/waiting`)
        } else if(res.data.status==='400') {
            console.log("unpaid order",res.data.data)
            navigate(`/passenger/payment/${res.data.data}`)
        }
        else {
            console.log(res.data.message)
        }
    }

    //get user id
    useEffect(()=>{
        axios.defaults.headers.common["x-auth-token"] = auth;
        axios.get(`${serverUrl}/user`)
        .then(res=>{
            createRide.uid=res.data.data.uid
        }).catch(err=>{
            console.log(err)
        })
    },[])

    return (
        <div className='passengerCallCar__container'>
            <div className='googleMap__container'>
                <SelectableMap start={start} setStart={setStart} end={end} setEnd={setEnd} ride={createRide}/>    
            </div>
            <form className='carTypeSelect__container' onSubmit={submitHandler}>
                <h3>Select Ride Type</h3>
                <select value={rideType} onChange={(e)=>setRideType(e.target.value as 'Economy' | 'Comfort' | 'Luxury')}>
                    <option value="Economy">Economy</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Luxury">Luxury</option>
                </select>
                <button type='submit' >Call a Car</button>
            </form>
        </div>
    )
}

export default PassengerCallCar