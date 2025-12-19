import React from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { FaStar, FaRegHeart, FaRegClock } from "react-icons/fa";

const GigCard = ({ item }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
  });

  const rating = !isNaN(item.totalStars / item.starNumber)
    ? Math.round((item.totalStars / item.starNumber) * 10) / 10
    : 0;

  return (
    <Link to={`/gig/${item._id}`} className="link">
      <div className="gigCard">
        <div className="image-container">
          <img src={item.cover} alt={item.title} />
          <div className="delivery-time">
            <FaRegClock />
            <span>{item.deliveryTime} Days Delivery</span>
          </div>
        </div>
        <div className="info">
          {isLoading ? (
            "loading"
          ) : error ? (
            "Something went wrong!"
          ) : (
            <div className="user">
              <img src={data.img || "/img/noavatar.jpg"} alt={data.username} />
              <div className="user-info">
                <span className="username">{data.username}</span>
                <div className="rating">
                  <FaStar className="star-icon" />
                  <span>{rating}</span>
                  <span className="reviews">({item.starNumber})</span>
                </div>
              </div>
            </div>
          )}
          <h3 className="title">{item.shortTitle}</h3>
          <p className="description">{item.shortDesc}</p>
          <div className="features">
            {item.features?.slice(0, 3).map((feature, index) => (
              <span key={index} className="feature">
                {feature}
              </span>
            ))}
          </div>
        </div>
        <div className="footer">
          <div className="price">
            <span>Starting at</span>
            <h2>${item.price}</h2>
          </div>
          <button className="favorite">
            <FaRegHeart />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
