import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Icon,
  Avatar,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
import UsersList from "./UsersList";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatArea = ({
  selectedGroup,
  socket,
  groups,
  userGroup,
  setGroups,
  setUserGroup,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [allGroupUsers, setAllGroupUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
  useEffect(() => {
    // fetchGroups();
    if (selectedGroup && socket) {
      const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
      //fetch messages
      fetchMessage();
      fetchGroups();
      fetchGroupMembers();
      socket.emit("join room", selectedGroup?._id);
      socket.on("message received", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
      socket.on("user in room", (users) => {
        setConnectedUsers(users);
      });
      socket.on("user joined", (user) => {
        setConnectedUsers((prev) => [...prev, user]);
      });
      socket.on("user left", (userId) => {
        setConnectedUsers((prev) => prev.filter((user) => user._id !== userId));
      });
      socket.on("notification", (notification) => {
        toast({
          title:
            notification?.type === "USER_JOINED" ? "New User" : "Notification",
          description: notification.message,
          status: "info",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      });
      socket.on("user typing", ({ username }) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      });
      socket.on("user stop typing", ({ username }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      });

      //clean up
      return () => {
        socket.emit("leave room", selectedGroup?._id);
        socket.off("message received");
        socket.off("users in room");
        socket.off("user joined");
        socket.off("user left");
        socket.off("notification");
        socket.off("user typing");
        socket.off("user stop typing");
      };
    }
  }, [selectedGroup, socket, toast]);

  const fetchMessage = async () => {
    const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
    const token = currentUser?.token;
    try {
      const { data } = await axios.get(
        `https://harshal-chat-app-backend.onrender.com/api/message/${selectedGroup?._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data);
    } catch (error) {
      console.log(error);
    }
  };

  //send messages
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }
    try {
      const token = currentUser?.token;
      const { data } = await axios.post(
        `https://harshal-chat-app-backend.onrender.com/api/message`,
        {
          content: newMessage,
          groupId: selectedGroup?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      socket.emit("new message", {
        ...data,
        groupId: selectedGroup?._id,
      });

      setMessages([...messages, data]);
      setNewMessage("");
      console.log("this is end");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  //handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit("typing", {
        username: currentUser.username,
        groupId: selectedGroup?._id,
      });
    }
    //clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    //set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stop typing", {
          groupId: selectedGroup?._id,
        });
      }
    }, 2000);
  };

  //format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  //render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    const typingUsersArray = Array.form(typingUsers);
    return typingUsersArray.map(() => {
      <Box
        key={username}
        alignSelf={
          username === currentUser?.username ? "flex-start" : "flex-end"
        }
        maxW="70%"
      >
        <Flex
          align="center"
          bg={username === currentUser?.username ? "blue.50" : "gray.50"}
          p={2}
          borderRadius="lg"
          gap={2}
        >
          {/*current user display on left */}
          {username === currentUser?.username ? (
            <>
              <Avatar size={xs} name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize={sm} color="gray.500" fontStyle="italic">
                  You are typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => {
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      borderRadius="full"
                      bg="gray.500"
                    ></Box>;
                  })}
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize={sm} color="gray.500" fontStyle="italic">
                  {username} is typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => {
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      borderRadius="full"
                      bg="gray.500"
                    ></Box>;
                  })}
                </Flex>
              </Flex>
              <Avatar size={xs} name={username} />
            </>
          )}
        </Flex>
      </Box>;
    });
  };

  //fetch all groups
  const fetchGroups = async () => {
    //fetch all groups
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.token;
      const { data } = await axios.get(`https://harshal-chat-app-backend.onrender.com/api/group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroups(data);
      //get user groups
      const userGroupsIds = data
        ?.filter((group) => {
          return group?.members?.some(
            (member) => member?._id === userInfo?._id
          );
        })
        .map((group) => group?._id);

      setUserGroup(userGroupsIds);
    } catch (error) {
      toast({
        title: "Failed to fetch groups",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  //fetch group members
  const fetchGroupMembers = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
    const token = userInfo.token;
    try {
      const { data } = await axios.get(`https://harshal-chat-app-backend.onrender.com/api/group`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const selectedGroupObj = groups.find(
        (group) => group._id === selectedGroup?._id
      ).members;

      setAllGroupUsers(selectedGroupObj);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex h="100%" position="relative">
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.800"
        maxW={`calc(100% - 260px)`}
      >
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <Flex px={6} py={4} bg="gray.900" align="center" boxShadow="sm">
              <Icon
                as={FiMessageCircle}
                fontSize="24px"
                color="yellow.400"
                mr={3}
              />
              <Box flex="1">
                <Text fontSize="lg" fontWeight="bold" color="gray.100">
                  {selectedGroup.name}
                </Text>
                <Text fontSize="sm" color="gray.200">
                  {selectedGroup.description}
                </Text>
              </Box>
              <Icon
                as={FiInfo}
                fontSize="20px"
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "yellow.400" }}
              />
            </Flex>

            {/* Messages Area */}
            <VStack
              flex="1"
              overflowY="auto"
              spacing={4}
              align="stretch"
              px={6}
              py={4}
              position="relative"
              sx={{
                // hide scrollbar for Chrome, Edge, Safari
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                // hide scrollbar for Firefox
                scrollbarWidth: "none",
                // optional smooth scrolling
                scrollBehavior: "smooth",
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  alignSelf={
                    message.sender._id === currentUser?._id
                      ? "flex-start"
                      : "flex-end"
                  }
                  maxW="70%"
                >
                  <Flex direction="column" gap={1}>
                    <Flex
                      align="center"
                      mb={1}
                      justifyContent={
                        message?.sender._id === currentUser?._id
                          ? "flex-start"
                          : "flex-end"
                      }
                      gap={2}
                    >
                      {message?.sender._id === currentUser?._id ? (
                        <>
                          <Avatar
                            size="xs"
                            bg="blue.500"
                            color="black"
                            name={message.sender.username}
                          />
                          <Text fontSize="xs" color="gray.100">
                            You • {formatTime(message.createdAt)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text fontSize="xs" color="gray.100">
                            {message.sender.username} •{" "}
                            {formatTime(message.createdAt)}
                          </Text>
                          <Avatar
                            bg="green.500"
                            color="black"
                            size="xs"
                            name={message.sender.username}
                          />
                        </>
                      )}
                    </Flex>

                    <Box
                      bg={
                        message?.sender._id === currentUser?._id
                          ? "yellow.200"
                          : "gray.300"
                      }
                      color={
                        message?.sender._id === currentUser?._id
                          ? "gray.900"
                          : "gray.800"
                      }
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                    >
                      <Text>{message.content}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>

            {/* Message Input */}
            {userGroup.includes(selectedGroup._id) ? (
              <Box p={4} bg="gray.900" position="relative" zIndex="1">
                <InputGroup size="lg">
                  <Input
                    value={newMessage}
                    placeholder="Type your message..."
                    pr="4.5rem"
                    bg="gray.700"
                    _placeholder={{ color: "gray.200" }}
                    textColor="white"
                    border="none"
                    _focus={{
                      boxShadow: "none",
                      bg: "gray.600",
                    }}
                    onChange={handleTyping}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      colorScheme="yellow"
                      borderRadius="full"
                      onClick={sendMessage}
                      _hover={{
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Icon as={FiSend} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            ) : (
              <>
                <Box p={6} bg="gray.900" position="relative" zIndex="1"></Box>
              </>
            )}
          </>
        ) : (
          <>
            <Flex
              h="100%"
              direction="column"
              align="center"
              justify="center"
              p={8}
              textAlign="center"
            >
              <Icon
                as={FiMessageCircle}
                fontSize="64px"
                color="gray.300"
                mc={4}
              />
              <Text fontSize="xl" fontWeight="medium" color="gray.500">
                Welcome to the chat
              </Text>
              <Text mb={2} color="gray.500">
                Select a group from the sidebar to start chatting
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* UsersList with fixed width */}
      <Box
        width="260px"
        position="sticky"
        right={0}
        bg="gray.900"
        top={0}
        height="100%"
        flexShrink={0}
      >
        {selectedGroup && (
          <UsersList
            connectedUsers={connectedUsers}
            allGroupUsers={allGroupUsers}
          />
        )}
      </Box>
    </Flex>
  );
};

export default ChatArea;
