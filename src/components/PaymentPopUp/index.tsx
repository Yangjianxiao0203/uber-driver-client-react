import axios from "axios";
import { useEffect,useState,useContext } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../../constant";
import { getUser } from "../../utils/getUser";
import { AuthContext } from "../../utils/AuthProvider";
import { useNavigate } from "react-router-dom";

var user:any=null;
var order:any = null;
var paymentUrl:any = null;
var serialNumber:any = null;

interface paymentRequest {
    uid:string;
    platform:string;
    trade_no:string|null;
}

const PaymentPopUp = () => {

    const {rid} = useParams();
    const {auth} = useContext(AuthContext);

    const [isLoading,setIsLoading] = useState(true);

    const [paymentSuccess,setPaymentSuccess] = useState(false);
    const navigate = useNavigate();
    //get user
    useEffect(()=>{
        getUser(auth)
        .then(res=>{
            user=res;
        });
    },[])

    //get order info
    useEffect(()=>{
        axios.get(`${serverUrl}/order?rid=${rid}`)
        .then(res=>{
            order = res.data.data;
            console.log("order: ",order);
            setIsLoading(false);
        }).catch((err)=>{console.log("err",err)});
    },[])

    const [platform,setPlatform] = useState("Alipay");

    // submit request to backend and return a serial number
    const onSubmit = async (e:any) => {
        e.preventDefault();
        console.log("submit payment request");
        const request:paymentRequest = {
            uid:user.uid,
            platform:platform,
            trade_no:null
        }
        console.log("request:",request);
        const res = await axios.put(`${serverUrl}/order/${order.id}`,request)
        paymentUrl = res.data.data;

         // generate serialNumber and send request immediately after getting paymentUrl
        if (paymentUrl) {
            serialNumber = paymentUrl + Math.random().toString(36).substr(2, 9);
            const request:paymentRequest = {
                uid:user.uid,
                platform:platform,
                trade_no:serialNumber
            }
            console.log("serialNUmber request:",request);
            axios.put(`${serverUrl}/order/${order.id}`,request)
            .then(res=>{
                console.log("res:",res.data);
                if(res.data.data==='success') {
                    setPaymentSuccess(true);
                }
            })
        }
    }

    useEffect(()=>{
        if(paymentSuccess) {
            // navigate to create ride page
            console.log("payment success");
            navigate(`/passenger/review/${rid}`);
        }
    },[paymentSuccess])

    if(isLoading) {
        return <div>loading...</div>
    }

    return (
        <form style={{display:"flex",flexDirection:"column"}} onSubmit={onSubmit}>
            <h3>Ride Payment: </h3>
            <h4>total cost: {order.totalCost}</h4>
            <label>
                Platform:
                <select value={platform} onChange={e=>{setPlatform(e.target.value)}}>
                    <option value="Alipay">Alipay</option>
                    <option value="Wechat">Wechat</option>
                    <option value="Paypal">Paypal</option>
                </select>
            </label>
            <button type="submit">Pay</button>
        </form>
    )
}
export default PaymentPopUp;