import React,{useEffect, useState,useContext} from 'react'

import { AuthContext } from '../../utils/AuthProvider';


export default function Root() {

    const authContext = useContext(AuthContext);
    if(!authContext) {
        throw new Error('AuthContext is null');
    }
    const {auth} = authContext;


  return <div>hello {auth}</div>;
}
