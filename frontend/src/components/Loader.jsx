import { CircularProgress } from "@mui/material";

function Loader() {

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <CircularProgress />
    </div>
  );

}

export default Loader;