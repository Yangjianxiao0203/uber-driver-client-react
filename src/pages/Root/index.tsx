import React,{useEffect, useState,useContext} from 'react'

import { AuthContext } from '../../utils/AuthProvider';


export default function Root() {

    const authContext = useContext(AuthContext);
    if(!authContext) {
        throw new Error('AuthContext is null');
    }
    const {auth} = authContext;

    //获取当前位置
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

  return <div>hello {auth}</div>;
}
