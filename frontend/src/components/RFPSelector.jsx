import React, { useEffect, useState } from "react";
import { getRFPs } from "../services/api";

function RFPSelector({ rfpId, setRfpId }) {

  const [rfpList, setRfpList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRFPs = async () => {

      try {

        // const res = await getRFPs();

        // console.log("RFP API Response:", res.data);

        // if (res.data && res.data.rfps) {
        //   setRfpList(res.data.rfps);
        // }
        const res = await getRFPs();
        console.log("API Response:", res.data);
        console.log("RFP List:", res.data.rfps);

        if (res.data && res.data.rfps) {
          setRfpList(res.data.rfps);
        }
        else {
          console.warn("No rfps field in response");
        }

      } catch (err) {

        console.error("Failed to fetch RFPs:", err);

      } finally {
        setLoading(false);
      }

    };

    fetchRFPs();

  }, []);

  return (

    <select
      className="rfp-select"
      value={rfpId}
      onChange={(e) => setRfpId(e.target.value)}
    >

      <option value="">
        {loading ? "Loading RFPs..." : "Select RFP"}
      </option>

      {rfpList.map((rfp) => (

        <option key={rfp} value={rfp}>
          {rfp}
        </option>

      ))}

    </select>

  );

}

export default RFPSelector;