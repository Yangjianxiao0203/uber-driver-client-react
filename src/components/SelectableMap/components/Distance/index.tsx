const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  if (!leg.distance || !leg.duration) return null;

  return (
    <div>
      <p>
        Start : {leg.start_address}
        <br />
        <br />
        End : {leg.end_address}
        <br />
        <br />
        Ride distance: <span className="highlight">{leg.distance.text}</span>
        <br />
        Estimated time: <span className="highlight">{leg.duration.text}</span>
      </p>
    </div>
  );
}