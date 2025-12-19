import React, { useState } from "react";
import "./Bids.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

const Bids = ({ gigId }) => {
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  const { isLoading, error: queryError, data: bids } = useQuery({
    queryKey: ["bids", gigId],
    queryFn: () =>
      newRequest.get(`/bids/${gigId}`).then((res) => {
        return res.data;
      }),
  });

  const createBidMutation = useMutation({
    mutationFn: (bid) => {
      return newRequest.post("/bids", bid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bids", gigId]);
      setPrice("");
      setDesc("");
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Something went wrong!");
    },
  });

  const updateBidStatusMutation = useMutation({
    mutationFn: ({ bidId, status }) => {
      return newRequest.put(`/bids/${bidId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bids", gigId]);
      // Also invalidate the gig query to update purchase button status
      queryClient.invalidateQueries(["gig"]);
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Could not update bid status!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please sign in to place a bid");
      return;
    }
    if (!price.trim() || !desc.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }
    createBidMutation.mutate({ gigId, price: Number(price), desc });
  };

  const handleBidAction = (bidId, status) => {
    try {
      updateBidStatusMutation.mutate({ bidId, status });
    } catch (err) {
      console.error("Error updating bid status:", err);
      setError("Failed to update bid status. Please try again.");
    }
  };

  const hasUserBid = bids?.some(
    (bid) => bid.userId._id === currentUser?._id
  );

  return (
    <div className="bids-content">
      <h2>Bids</h2>
      {error && <div className="error-message">{error}</div>}
      {isLoading ? (
        "loading"
      ) : queryError ? (
        "Something went wrong!"
      ) : (
        <>
          {bids?.map((bid) => (
            <div className="bid" key={bid._id}>
              <div className="user">
                <img
                  className="pp"
                  src={bid.userId.img || "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="info">
                  <span>{bid.userId.username}</span>
                  <div className="country">
                    <span>{bid.userId.country}</span>
                  </div>
                </div>
              </div>
              <div className="bid-details">
                <span className="price">${bid.price}</span>
                <p>{bid.desc}</p>
                <span className={`status ${bid.status}`}>{bid.status}</span>
                {currentUser?.isSeller && bid.status === "pending" && (
                  <div className="action-buttons">
                    <button 
                      className="approve-button"
                      onClick={() => handleBidAction(bid._id, "accepted")}
                      disabled={updateBidStatusMutation.isLoading}
                    >
                      {updateBidStatusMutation.isLoading ? "Processing..." : "Approve Bid"}
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleBidAction(bid._id, "rejected")}
                      disabled={updateBidStatusMutation.isLoading}
                    >
                      {updateBidStatusMutation.isLoading ? "Processing..." : "Reject Bid"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!currentUser?.isSeller && !hasUserBid && (
            <div className="add">
              <h3>Place a Bid</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Enter your price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Describe your bid"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <button type="submit" disabled={createBidMutation.isLoading}>
                  {createBidMutation.isLoading ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bids; 