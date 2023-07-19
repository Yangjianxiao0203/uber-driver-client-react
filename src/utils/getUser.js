import axios from "axios"
import { serverUrl } from "../constant";
export const getUser = async (auth) => {
    try {
        axios.defaults.headers.common['x-auth-token'] = auth;
        const res = await axios.get(`${serverUrl}/user`);
        return res.data.data;
    } catch (err) {
        console.log(err)
    }
}