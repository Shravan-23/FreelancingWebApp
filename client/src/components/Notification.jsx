import React, { useEffect } from "react";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import moment from "moment";
import { Link } from "react-router-dom";

const queryClient = new QueryClient();

const Notification = () => {
  useEffect(() => {
    console.log("=== Notification Component Mounted ===");
  }, []);

  const { isLoading, error, data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        console.log("=== Fetching Notifications ===");
        const token = localStorage.getItem("currentUser");
        console.log("Auth token:", token ? "Present" : "Missing");
        
        if (!token) {
          console.error("No authentication token found");
          throw new Error("Not authenticated");
        }
        
        const response = await newRequest.get("/notifications/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("=== Notifications Response ===");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        
        return response.data;
      } catch (err) {
        console.error("=== Error Fetching Notifications ===");
        console.error("Error details:", err.response?.data || err.message);
        throw err;
      }
    },
    retry: 3,
    refetchInterval: 30000,
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  if (isLoading) {
    console.log("Loading notifications...");
    return <div className="loading">Loading notifications...</div>;
  }
  
  if (error) {
    console.error("Error state:", error);
    return <div className="error">Error loading notifications: {error.message}</div>;
  }

  console.log("=== Rendering Notifications ===");
  console.log("Number of notifications:", data?.length || 0);

  return (
    <div className="notifications">
      {data && Array.isArray(data) && data.length > 0 ? (
        data.map((notification) => (
          <div
            key={notification._id}
            className={`notification ${!notification.isRead ? "unread" : ""}`}
          >
            <div className="notification-content">
              <p>{notification.message}</p>
              <span className="time">
                {moment(notification.createdAt).fromNow()}
              </span>
            </div>
            <div className="notification-actions">
              <Link to={`/gig/${notification.gigId}`}>
                <button>View Gig</button>
              </Link>
              {!notification.isRead && (
                <button onClick={() => handleRead(notification._id)}>
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="no-notifications">No new bid requests</p>
      )}
    </div>
  );
};

const NotificationWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <Notification />
  </QueryClientProvider>
);

export default NotificationWithProvider; 