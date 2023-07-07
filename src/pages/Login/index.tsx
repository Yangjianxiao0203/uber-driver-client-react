import React,{useState,useContext} from "react";
import { Identity,IdentityType,serverUrl} from "../../constant";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthProvider";
import { Link } from "react-router-dom";
interface LoginRequest {
    phoneNumber: string;
    password: string;
}

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    if(!authContext) {
        throw new Error('AuthContext is null');
    }

    const {auth,setAuthToken} = authContext;

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: LoginRequest = {
            phoneNumber,
            password,
        }
        try {
            const response = await axios.get(`${serverUrl}/login`, {params: data});
            console.log(response);
            const token = response.data.data;
            localStorage.setItem('token', token);
            setAuthToken(token);
            navigate('/passenger');
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
          <input type="submit" value="Login" />
        </form>
        <Link to="/register">Register</Link>
      </>
    )
}
export default Login;