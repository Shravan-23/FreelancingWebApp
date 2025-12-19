import React, { useState } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import newRequest from "../utils/newRequest";
import { FaBell } from "react-icons/fa";
import "./NotificationBell.scss";

const queryClient = new QueryClient();

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = localStorage.getItem("currentUser");
      if (!token) return [];
      
      const response = await newRequest.get("/notifications/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
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

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await mutation.mutateAsync(notification._id);
      
      // Navigate to the specific gig
      navigate(`/gig/${notification.gigId}`);
      
      // Close the dropdown
      setIsOpen(false);
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="notification-bell">
      <div 
        className="bell-icon" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          {notifications?.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
                {!notification.isRead && (
                  <span className="new-badge">New</span>
                )}
              </div>
            ))
          ) : (
            <div className="no-notifications">No new notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 