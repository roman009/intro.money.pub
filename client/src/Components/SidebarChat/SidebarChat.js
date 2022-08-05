import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SidebarChat.css";

function SidebarChat({ id, name, chatDetails, conversationText }) {
  return (
    // <Link to={`/rooms/${id}`}>
    <div className={`sidebarChat ${chatDetails}`}>
      <div className="avatar">
        {/* <p>{name.charAt(1)}</p> */}
        A
        </div>
      <div className="sidebarChat__info">
        <div className="sidebarChat__info__name">{name}</div>
        <p className="sidebarChat__info__message">{conversationText}</p>
      </div>
    </div>
    // </Link>
  );
}

export default SidebarChat;
