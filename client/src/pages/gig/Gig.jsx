import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import Bids from "../../components/bids/Bids";
import getCurrentUser from "../../utils/getCurrentUser";
import { FaStar, FaRegStar } from "react-icons/fa";

function Gig() {
  const { id } = useParams();
  const currentUser = getCurrentUser();

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  const { isLoading: isLoadingBids, data: bids } = useQuery({
    queryKey: ["bids", id],
    queryFn: () =>
      newRequest.get(`/bids/${id}`).then((res) => {
        console.log("Fetched bids:", res.data);
        return res.data;
      }),
  });

  const isOwnGig = currentUser?._id === userId;
  const isSeller = currentUser?.isSeller;
  
  // Detailed debug logs
  console.log("Debug Info:");
  console.log("Current User:", {
    id: currentUser?._id,
    isSeller: currentUser?.isSeller,
    username: currentUser?.username
  });
  console.log("All Bids:", bids);
  
  const hasApprovedBid = bids?.some((bid) => {
    console.log("Checking bid:", {
      bidId: bid._id,
      bidUserId: bid.userId._id,
      currentUserId: currentUser?._id,
      bidStatus: bid.status,
      bidUserData: bid.userId
    });
    return bid.userId._id === currentUser?._id && bid.status === "accepted";
  });

  const getStarRating = () => {
    if (!data?.totalStars || !data?.starNumber || data.starNumber === 0) {
      return 0;
    }
    return Math.round(data.totalStars / data.starNumber);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className="star-icon">
        {index < rating ? <FaStar className="filled" /> : <FaRegStar className="empty" />}
      </span>
    ));
  };

  const renderSlider = () => {
    if (!data || !data.images) {
      return (
        <div className="slider-fallback">
          <img src="/img/noimage.jpg" alt="No image available" />
        </div>
      );
    }

    const images = Array.isArray(data.images) ? data.images : [];
    
    if (images.length === 0) {
      return (
        <div className="slider-fallback">
          <img src="/img/noimage.jpg" alt="No image available" />
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <div className="single-image">
          <img src={images[0]} alt="Gig image" />
        </div>
      );
    }

    return (
      <div className="slider-container">
        <Slider dots arrows>
          {images.map((img, index) => (
            <div key={index}>
              <img src={img} alt={`Gig image ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    );
  };

  const getPurchaseStatus = () => {
    console.log("Purchase Status Check:", {
      isOwnGig,
      isSeller,
      hasApprovedBid,
      currentUserId: currentUser?._id,
      gigOwnerId: userId,
      currentUserData: currentUser
    });

    if (!currentUser) {
      return {
        canPurchase: false,
        message: "Sign in to Continue",
        link: "/login"
      };
    }
    if (isOwnGig) {
      return {
        canPurchase: false,
        message: "This is your own gig"
      };
    }
    if (isSeller) {
      return {
        canPurchase: false,
        message: "Sellers cannot purchase gigs"
      };
    }
    if (!hasApprovedBid) {
      return {
        canPurchase: false,
        message: "Place a bid and wait for seller approval"
      };
    }
    return {
      canPurchase: true,
      link: `/pay/${id}`
    };
  };

  const purchaseStatus = getPurchaseStatus();
  const starRating = getStarRating();

  if (isLoading) {
    return <div className="gig loading">Loading...</div>;
  }

  if (error) {
    return <div className="gig error">Something went wrong!</div>;
  }

  return (
    <div className="gig">
      <div className="container">
        <span className="breadcrumbs">
          Skillhive {">"} {data.cat} {">"}
        </span>
        <div className="left">
          <h1>{data.title}</h1>
          {isLoadingUser ? (
            "loading"
          ) : errorUser ? (
            "Something went wrong!"
          ) : (
            <div className="user">
              <img
                className="pp"
                src={dataUser.img || "/img/noavatar.jpg"}
                alt=""
              />
              <span>{dataUser.username}</span>
              <div className="stars">
                {renderStars(starRating)}
                {starRating > 0 && <span>{starRating}</span>}
              </div>
            </div>
          )}
          {renderSlider()}
          <h2>About This Gig</h2>
          <p>{data.desc}</p>
          {isLoadingUser ? (
            "loading"
          ) : errorUser ? (
            "Something went wrong!"
          ) : (
            <div className="seller">
              <h2>About The Seller</h2>
              <div className="user">
                <img src={dataUser.img || "/img/noavatar.jpg"} alt="" />
                <div className="info">
                  <span>{dataUser.username}</span>
                  <button>Contact Me</button>
                </div>
              </div>
              <div className="box">
                <div className="items">
                  <div className="item">
                    <span className="title">From</span>
                    <span className="desc">{dataUser.country}</span>
                  </div>
                  <div className="item">
                    <span className="title">Member since</span>
                    <span className="desc">Aug 2022</span>
                  </div>
                  <div className="item">
                    <span className="title">Avg. response time</span>
                    <span className="desc">4 hours</span>
                  </div>
                  <div className="item">
                    <span className="title">Last delivery</span>
                    <span className="desc">1 day</span>
                  </div>
                  <div className="item">
                    <span className="title">Languages</span>
                    <span className="desc">English</span>
                  </div>
                </div>
                <hr />
                <p>{dataUser.desc}</p>
              </div>
            </div>
          )}
          <div className="reviews">
            <h2>Reviews</h2>
            <Reviews gigId={id} />
          </div>
          <div className="bids-section">
            <Bids gigId={id} />
          </div>
        </div>
        <div className="right">
          <div className="price">
            <h3>{data.shortTitle}</h3>
            <h2>$ {data.price}</h2>
          </div>
          <p>{data.shortDesc}</p>
          <div className="details">
            <div className="item">
              <img src="/img/clock.png" alt="" />
              <span>{data.deliveryDate} Days Delivery</span>
            </div>
            <div className="item">
              <img src="/img/recycle.png" alt="" />
              <span>{data.revisionNumber} Revisions</span>
            </div>
          </div>
          <div className="features">
            {data.features?.map((feature) => (
              <div className="item" key={feature}>
                <img src="/img/greencheck.png" alt="" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {purchaseStatus.link ? (
            <Link to={purchaseStatus.link}>
              <button className="purchase-button">
                {purchaseStatus.message || "Continue"}
              </button>
            </Link>
          ) : (
            <div className="error-message">
              {purchaseStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gig;
