import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { AuthContext} from '../../utils/AuthProvider';
import { serverUrl } from '../../constant';

export default function Root() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.auth === null) {
            navigate('/login');
        }
        getSelfType();
    }, [authContext]);

    useEffect(() => {
        if (authContext.auth === null) {
            navigate('/login');
        }
    }, [authContext, navigate]);

    //get self type
    const getSelfType = async () => {
        const { auth, setAuthToken } = authContext;
        axios.defaults.headers.common['x-auth-token'] = auth;
        try {
            const response = await axios.get(`${serverUrl}/user`);
            const user = response.data.data;
            console.log(user);
            if (user === null) {
                navigate('/login');
            }
            setLoading(false);
            if (user.identity === "Driver") {
                navigate('/driver');
            } else if (user.identity === "Passenger") {
                navigate('/passenger/createRide');
            }
        } catch (error) {
            console.log(error);
            navigate('/login');
        }
    }

    return <div>hello {loading}</div>;
}
