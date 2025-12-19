import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const { isLoading, error, data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  // Fetch user information for each conversation
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!conversations) return {};
      const userIds = conversations.map(c => 
        currentUser.isSeller ? c.buyerId : c.sellerId
      );
      const uniqueUserIds = [...new Set(userIds)];
      const promises = uniqueUserIds.map(id => 
        newRequest.get(`/users/${id}`).then(res => res.data)
      );
      const userList = await Promise.all(promises);
      return Object.fromEntries(userList.map(user => [user._id, user]));
    },
    enabled: !!conversations,
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => {
                const otherUser = users?.[currentUser.isSeller ? c.buyerId : c.sellerId];
                return (
                  <tr
                    className={
                      ((currentUser.isSeller && !c.readBySeller) ||
                        (!currentUser.isSeller && !c.readByBuyer)) &&
                      "active"
                    }
                    key={c.id}
                  >
                    <td>
                      <div className="user-info">
                        {otherUser?.img && (
                          <img
                            src={otherUser.img}
                            alt={otherUser.username}
                            className="user-avatar"
                          />
                        )}
                        <span>{otherUser?.username || "Loading..."}</span>
                      </div>
                    </td>
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {c?.lastMessage?.substring(0, 100)}
                        {c?.lastMessage?.length > 100 ? "..." : ""}
                      </Link>
                    </td>
                    <td>{moment(c.updatedAt).fromNow()}</td>
                    <td>
                      {((currentUser.isSeller && !c.readBySeller) ||
                        (!currentUser.isSeller && !c.readByBuyer)) && (
                        <button onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;