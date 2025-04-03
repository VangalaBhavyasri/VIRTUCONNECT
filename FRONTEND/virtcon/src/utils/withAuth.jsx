import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"
import "../App.css";
const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const isAuthenticated = () => {
            console.log(localStorage.getItem("token"));
            if(localStorage.getItem("token")) {
                return true;
            } 
            return false;
        }

        useEffect(() => {
            if(!isAuthenticated()) {
                 
                router("/auth")
            }
        }, [])

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;