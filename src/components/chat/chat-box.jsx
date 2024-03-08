import { useEffect, useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import styles from "./chat-box.module.css";
import "./Chat.css";

const API_KEY = ""; // todo: replace with your API key here (or move this to a process.env file)

const Chat = () => {
  const [transcriptText, setTranscriptText] = useState("");

  const [messages, setMessages] = useState([
    {
      message:
        "Hey there! I'm your personal YouTube Assistant! Do you have any questions about the video you're watching?",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const getSystemMessage = () => {
    const videoId = document.querySelector('.js-videoUrlText').textContent;
    fetch("http://127.0.0.1:5000/get_transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_id: videoId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTranscriptText(data.transcript);
      })
      .catch((error) => console.error("Error:", error));

      return {
        role: "system",
        content:
          "Use the provided transcipt of the YouTube video to answer any incoming questions, and try to tell the user the timestamp in the video from where you get the answer, if possible. for answers for which this is possible, format the answer like 'According to <timestamp> second mark, ...', but don't try to enforce this when you can't find the timestamp:" +
          transcriptText,
      };
  }

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [getSystemMessage(), ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className={styles.chatcontainer}>
      <div
        className="js-wtf"
        style={{ height: "500px", width: "400px", marginTop: "2px" }}
      >
        <div style={{display: 'none'}} className="js-videoUrlText"></div>
        <MainContainer style={{ backgroundColor: "transparent" }}>
          <ChatContainer style={{ backgroundColor: "transparent" }}>
            <MessageList
              style={{
                backgroundColor: "transparent",
                padding: "0px",
                paddingBottom: "10px",
              }}
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="YouTube Question Bot is typing..." />
                ) : null
              }
            >
              {messages.map((message, i) => {
                console.log(message, i);
                return <Message className="msg" key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Ask a question..." onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
};

export default Chat;
