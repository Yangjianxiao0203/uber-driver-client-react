import React,{useContext, useState} from "react";
import { Identity,IdentityType,serverUrl} from "../../constant";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthProvider";

interface RegisterRequest {
    phoneNumber: string;
    secretKey: string;
    identity: IdentityType;
}

const Register = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState<IdentityType>(Identity.Passenger);
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    if(!authContext) {
        throw new Error('AuthContext is null');
    }
    const {setAuthToken} = authContext;

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: RegisterRequest = {
            phoneNumber,
            secretKey: password,
            identity
        }
        try {
            const response = await axios.post(`${serverUrl}/user`, data);
            console.log(response);
            const token = response.data.data;
            localStorage.setItem('token', token);
            setAuthToken(token);
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
    <>
      <form onSubmit={submitForm}>
        <label>
          Phone Number:
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
            Identity:
            <select value={identity} onChange={(e) => setIdentity(e.target.value as IdentityType)}>
                <option value={Identity.Driver}>Driver</option>
                <option value={Identity.Passenger}>Passenger</option>
            </select>
        </label>
        <input type="submit" value="Register" />
      </form>
      <Link to="/login">Login</Link>
    </>
    )
}
export default Register;