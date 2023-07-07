import React, { useState, useEffect } from 'react';

interface RideItemProps {
    item: any;
    handleOrder: (orderId: string) => void;
    isLoading: boolean;
}
const RideItem = ({item, handleOrder,isLoading}:RideItemProps) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    setButtonDisabled(true);
    const timeout = setTimeout(() => {
      setButtonDisabled(false);
    }, 50);
    return () => clearTimeout(timeout);
  }, [item]);

  return (
    <div key={"ride"+item.id} style={{marginLeft:"20"}}>
      <h4>*********Ride #{item.id}**********</h4>
      <p>Starting point: {item.startPointAddress}</p>
      <p>Ending point: {item.endPointAddress}</p>
      <p>Estimated ride length: {item.rideLength}</p>
      <button 
        disabled={buttonDisabled && isLoading} 
        onClick={() => handleOrder(item.id)}>
        Accept Order
      </button>
    </div>
  );
}

export default RideItem;
