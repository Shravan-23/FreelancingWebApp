import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import newRequest from "../../utils/newRequest";
import NotificationBell from "../NotificationBell";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  // const currentUser = null

  const currentUser =JSON.parse(localStorage.getItem("currentUser"));
  const navigate=useNavigate();
   const handLogout=async()=>{
    try{
      await newRequest.post("/auth/logout")
      localStorage.setItem("currentUser", null);
      navigate("/")


    }catch(err){
    console.log("Error")
    }
   };

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/">
            <span className="text">Skillhive</span>
          </Link>
          <span className="dot">.</span>
        </div>
        <div className="links">
          <span>Skillhive Business</span>
          <span>Explore</span>
          {!currentUser?.isSeller && <span>Become a Seller</span>}
          {currentUser?.isSeller && <NotificationBell />}
          {currentUser ? (
            <div className="user" onClick={()=>setOpen(!open)}>
              <img
                src={currentUser.img || "/img/instagram.png" }
                alt=""
              />
              <span>{currentUser?.username}</span>
              {open && <div className="options">
                {currentUser.isSeller && (
                  <>
                    <Link className="link" to="/mygigs">
                      Gigs
                    </Link>
                    <Link className="link" to="/add">
                      Add New Gig
                    </Link>
                  </>
                )}
                <Link className="link" to="/orders">
                  Orders
                </Link>
                <Link className="link" to="/messages">
                  Messages
                </Link>
                <Link className="link" onClick={handLogout}>
                  Logout
                </Link>
              </div>}
            </div>
          ) : (
            <>
            <Link className="link" to="/login">
                <button>Login</button>
              </Link>
              <Link className="link" to="/register">
                <button>Signup</button>
              </Link>
            </>
          )}
        </div>
      </div>
      {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu">
            {/* <Link className="link menuLink" to="/">
              Graphics & Design
            </Link>
            <Link className="link menuLink" to="/">
              Video & Animation
            </Link>
            <Link className="link menuLink" to="/">
              Writing & Translation
            </Link>
            <Link className="link menuLink" to="/">
              AI Services
            </Link>
            <Link className="link menuLink" to="/">
              Digital Marketing
            </Link>
            <Link className="link menuLink" to="/">
              Music & Audio
            </Link>
            <Link className="link menuLink" to="/">
              Programming & Tech
            </Link>
            <Link className="link menuLink" to="/">
              Business
            </Link>
            <Link className="link menuLink" to="/">
              Lifestyle
            </Link> */}
          </div>
          <hr />
        </>
      )}
    </div>
  );
}

export default Navbar;
