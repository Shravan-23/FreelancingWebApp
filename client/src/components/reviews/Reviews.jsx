import React, { useState } from "react";
import "./Reviews.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

const Reviews = ({ gigId }) => {
  const [desc, setDesc] = useState("");
  const [star, setStar] = useState(1);
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();

  const queryClient = useQueryClient();

  const { isLoading, error: queryError, data } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {
        return res.data;
      }),
  });

  const hasUserReviewed = data?.some(
    (review) => review.userId._id === currentUser?._id
  );

  const mutation = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      setDesc("");
      setStar(1);
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "You have already reviewed this gig!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please sign in to add a review");
      return;
    }
    if (hasUserReviewed) {
      setError("You have already reviewed this gig");
      return;
    }
    if (!desc.trim()) {
      setError("Please write your review");
      return;
    }
    mutation.mutate({ gigId, desc, star });
  };

  return (
    <div className="reviews-content">
      {isLoading ? (
        "loading"
      ) : queryError ? (
        "Something went wrong!"
      ) : (
        <>
          {data.map((review) => (
            <div className="review" key={review._id}>
              <div className="user">
                <img
                  className="pp"
                  src={review.userId.img || "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="info">
                  <span>{review.userId.username}</span>
                  <div className="country">
                    <span>{review.userId.country}</span>
                  </div>
                </div>
              </div>
              <div className="stars">
                {Array(review.star)
                  .fill()
                  .map((item, i) => (
                    <img src="/img/star.png" alt="" key={i} />
                  ))}
                <span>{review.star}</span>
              </div>
              <p>{review.desc}</p>
            </div>
          ))}
          <div className="add">
            <h3>Add a review</h3>
            {error && <div className="error-message">{error}</div>}
            <form action="" className="addForm" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Write your review"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={hasUserReviewed}
              />
              <select 
                value={star}
                onChange={(e) => setStar(Number(e.target.value))}
                disabled={hasUserReviewed}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              <button type="submit" disabled={hasUserReviewed}>
                {hasUserReviewed ? "Already Reviewed" : "Send"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Reviews;
