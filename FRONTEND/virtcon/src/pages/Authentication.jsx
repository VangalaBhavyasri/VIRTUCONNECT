import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';                  
const defaultTheme = createTheme();
export default function Authentication() {
    const [username,setUsername]=useState();
    const [name,setName]=useState();
    const [password,setPassword]=useState();
    const [formState,setFormState]=useState(0);
    const [error,setError]=useState();
    const [message,setMessage]=useState();
    const [open,setOpen]=useState(false);
    const {handleRegister,handleLogin,userData}=React.useContext(AuthContext);
    let handleAuth=async()=>{
        try{
            if(formState==0){
             let result =await handleLogin(username,password);
            }
            if(formState==1){
                let result=await handleRegister(name,username,password);
                let empty="";
                console.log(result);
                setName(name);
                setUsername(empty);
                setMessage(result);
                setOpen(true);
                setError(empty);
                setFormState(0);
                setPassword(empty);
              }
        }catch(err){
          console.log(err);
            let message=(err.response.data.message);
            setError(message);
        }
    }
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url("/photoimg6.avif")',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <div>
                <Button  variant={formState==0 ?"contained":""} onClick={()=>{setFormState(0)}}>
                    Sign in
                </Button>
                <Button  variant={formState==1 ?"contained":""} onClick={()=>{setFormState(1)}}>
                    Sign up
                </Button>
            </div>
            <Box component="form" noValidate  sx={{ mt: 1 }}>
                {formState==1?<TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Your good name"
                name="name"
                value={name}
                autoFocus
                onChange={(e)=>setName(e.target.value)}
              />:""}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="User name"
                name="username"
                value={username}
                autoFocus
                onChange={(e)=>setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                autoComplete="current-password"
                onChange={(e)=>setPassword(e.target.value)}
              />
              <p style={{color:"red"}}>{error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >{formState==0? "Login" :"Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
      open={open}
      autoHideDuration={4000}
      message={message}
      />
    </ThemeProvider>
  );
}