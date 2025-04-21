import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Icon,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { use } from "react";
import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({
  setSelectedGroup,
  groups,
  userGroup,
  setGroups,
  setUserGroup,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);

  // check if login user is an admin
  const checkAdminStatus = () => {
    // fetch user info from local storage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };
  //fetch all groups
  const fetchGroups = async () => {
    //fetch all groups
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.token;
      const { data } = await axios.get("https://harshal-chat-app-backend.onrender.com/api/group", {
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
  //fetch users group
  //create group
  const handleCreateGroup = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.token;
      await axios.post(
        "https://harshal-chat-app-backend.onrender.com/api/group",
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Group created successfully",
        description: "Your new group has been created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchGroups();
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  //logout
  const handleLogout = async () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  //join group
  const handleJoinGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.token;
      await axios.post(
        `https://harshal-chat-app-backend.onrender.com/api/group/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(groups.find((g) => g?._id === groupId));
      toast({
        title: "Group joined successfully",
        description: "You have joined the selected group.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to join group",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  //leave group
  const handleLeaveGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.token;
      await axios.post(
        `https://harshal-chat-app-backend.onrender.com/api/group/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(null);
      toast({
        title: "Left group successfully",
        description: "You have left the selected group.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to leave group",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      h="100%"
      bg="gray.900"
      width="300px"
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={4}
        bg="gray.900"
        position="sticky"
        top={0}
        zIndex={1}
        backdropFilter="blur(8px)"
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="yellow.400" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.100">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="yellow"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box
        flex="1"
        overflowY="auto"
        p={4}
        mb={16}
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
        <VStack spacing={3} overflowY="auto" align="stretch">
          {groups.map((group) => (
            <Box
              key={group.id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroup.includes(group._id) ? "yellow.300" : "gray.700"}
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "yellow",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box
                  onClick={() =>
                    userGroup.includes(group?._id && setSelectedGroup(group))
                  }
                  flex="1"
                >
                  <Flex align="center" mb={2}>
                    <Text
                      fontWeight="bold"
                      color={
                        userGroup.includes(group._id) ? "gray.900" : "gray.200"
                      }
                    >
                      {group.name}
                    </Text>
                    {userGroup.includes(group?._id) && (
                      <Badge ml={2} bg="yellow.200" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text
                    fontSize="sm"
                    color={
                      userGroup.includes(group._id) ? "gray.900" : "gray.200"
                    }
                    noOfLines={2}
                  >
                    {group.description}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme={userGroup.includes(group._id) ? "red" : "yellow"}
                  variant={userGroup.includes(group._id) ? "ghost" : "solid"}
                  ml={3}
                  onClick={() => {
                    userGroup.includes(group?._id)
                      ? handleLeaveGroup(group?._id)
                      : handleJoinGroup(group?._id);
                  }}
                  _hover={{
                    transform: userGroup.includes(group._id)
                      ? "scale(1.05)"
                      : "none",
                    bg: userGroup.includes(group._id)
                      ? "red.100"
                      : "yellow.100",
                  }}
                  transition="all 0.2s"
                >
                  {userGroup.includes(group?._id) ? (
                    <Text color="black" fontSize="sm" fontWeight="medium">
                      Leave
                    </Text>
                  ) : (
                    "Join"
                  )}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box
        p={4}
        bg="gray.900"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        width="100%"
      >
        <Button
          onClick={handleLogout}
          variant="ghost"
          color="yellow.300"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: "yellow.50",
            color: "yellow.800",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.900">
          <ModalHeader color="white">Create New Group</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel color="gray.300">Group Name</FormLabel>
              <Input
                value={newGroupName}
                bg="gray.800"
                color="white"
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="yellow.400"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel color="gray.300">Description</FormLabel>
              <Input
                bg="gray.800"
                color="white"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="yellow.400"
              />
            </FormControl>

            <Button
              colorScheme="yellow"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
