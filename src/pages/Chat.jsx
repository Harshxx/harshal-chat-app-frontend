import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const ENDPOINT = "https://harshal-chat-app-backend.onrender.com";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [userGroup, setUserGroup] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log(userInfo);

    const newSocket = io(ENDPOINT, { auth: { user: userInfo } });
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <Flex h="100vh">
      <Box w="300px" borderRight="1px solid" borderColor="gray.200">
        <Sidebar
          setSelectedGroup={setSelectedGroup}
          groups={groups}
          userGroup={userGroup}
          setGroups={setGroups}
          setUserGroup={setUserGroup}
        />
      </Box>
      <Box flex="1">
        {socket && (
          <ChatArea
            selectedGroup={selectedGroup}
            socket={socket}
            groups={groups}
            userGroup={userGroup}
            setGroups={setGroups}
            setUserGroup={setUserGroup}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Chat;
