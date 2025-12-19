import React, { useEffect, useState } from "react";
import Notification from "../components/Notification";
import "./Home.scss";
import newRequest from "../utils/newRequest";

const Home = () => {
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        console.log("Checking user type...");
        const res = await newRequest.get("/users/me");
        console.log("User data:", res.data);
        setIsSeller(res.data.isSeller);
        console.log("Is seller:", res.data.isSeller);
      } catch (err) {
        console.error("Error checking user type:", err);
      }
    };
    checkUserType();
  }, []);

  return (
    <div className="home">
      <div className="container">
        {isSeller && (
          <div className="notifications-section">
            <h1>Your Notifications</h1>
            <Notification />
          </div>
        )}
        {/* Rest of your home page content */}
      </div>
    </div>
  );
};

export default Home; 