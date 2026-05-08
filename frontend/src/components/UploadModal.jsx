import React from "react";
import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import UploadRFP from "./UploadRFP";

const UploadModal = ({ open, handleClose, onFileSelect }) => {

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Fade}
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx:{
          borderRadius:3,
          overflow:"hidden",
          width:"auto"
        }
      }}
      BackdropProps={{
        sx:{
          backdropFilter:"blur(5px)",
          backgroundColor:"rgba(0,0,0,0.2)"
        }
      }}
    >

      <Box sx={{position:"relative"}}>

        {/* CLOSE BUTTON INSIDE MODAL */}

        <IconButton
          onClick={handleClose}
          sx={{
            position:"absolute",
            right:8,
            top:8,
            zIndex:1,
            color:"gray",
            "&:hover":{
              color:"black",
              backgroundColor:"rgba(0,0,0,0.05)"
            }
          }}
        >
          <CloseIcon/>
        </IconButton>

        <DialogContent
          sx={{
            p:0,
            display:"flex",
            justifyContent:"center"
          }}
        >

          <UploadRFP onFileSelect={onFileSelect}/>

        </DialogContent>

      </Box>

    </Dialog>

  );

};

export default UploadModal;