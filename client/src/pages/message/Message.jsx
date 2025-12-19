import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";
import moment from "moment";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { isLoading: isLoadingConversation, data: conversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/${id}`).then((res) => res.data),
  });

  const { isLoading: isLoadingUser, data: otherUser } = useQuery({
    queryKey: ["user", conversation?.sellerId, conversation?.buyerId],
    queryFn: () => {
      const userId = currentUser.isSeller
        ? conversation.buyerId
        : conversation.sellerId;
      return newRequest.get(`/users/${userId}`).then((res) => res.data);
    },
    enabled: !!conversation,
  });

  const { isLoading, error, data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", id]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    if (!desc.trim()) return;
    
    mutation.mutate({
      conversationId: id,
      desc,
    });
    e.target[0].value = "";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> &gt;{" "}
          {isLoadingUser ? "loading..." : otherUser?.username} &gt;
        </span>
        {isLoading ? (
          "loading"
        ) : error ? (
          "error"
        ) : (
          <div className="messages">
            {messages.map((m) => (
              <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
                <img
                  src={m.userId === currentUser._id ? currentUser.img || "/img/noavatar.jpg" : otherUser?.img || "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="message-content">
                  <p>{m.desc}</p>
                  <span className="timestamp">{moment(m.createdAt).fromNow()}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea
            type="text"
            placeholder="Write a message..."
            rows="3"
            required
          />
          <button type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;