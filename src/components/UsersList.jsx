import {
  Box,
  VStack,
  Text,
  Badge,
  Flex,
  Icon,
  Tooltip,
  Avatar,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FiUsers, FiCircle } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";

const UsersList = ({ connectedUsers, allGroupUsers }) => {
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});

  return (
    <Box h="100%" w="100%" bg="gray.900" position="relative" overflow="hidden">
      {/* Header */}
      <Flex
        p={5}
        bg="gray.900"
        align="center"
        position="sticky"
        top={0}
        zIndex={1}
        boxShadow="sm"
      >
        <Icon as={FiUsers} fontSize="20px" color="yellow.400" mr={2} />
        <Text fontSize="lg" fontWeight="bold" color="gray.100">
          Members
        </Text>
        <Badge
          ml={2}
          colorScheme="yellow"
          borderRadius="full"
          px={2}
          py={0.5}
          fontSize="xs"
        >
          {allGroupUsers.length}
        </Badge>
      </Flex>

      {/* all group Member List */}
      <Box
        height="35%"
        flex="1"
        overflowY="auto"
        p={4}
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
        <VStack align="stretch" overflowY="auto" spacing={3}>
          {allGroupUsers.map((user) => (
            <Box key={user._id}>
              <Tooltip
                label={`${user.username} is ${
                  connectedUsers.some(
                    (connectedUser) => connectedUser._id === user._id
                  )
                    ? "online"
                    : "offline"
                }`}
                placement="left"
              >
                <Flex
                  p={3}
                  bg="gray.700"
                  borderRadius="lg"
                  shadow="sm"
                  align="center"
                >
                  <Avatar
                    size="sm"
                    name={user.username}
                    bg={
                      connectedUsers.some(
                        (connectedUser) => connectedUser._id === user._id
                      )
                        ? "green.400"
                        : "red.400"
                    }
                    color="black"
                    mr={3}
                  />
                  <Box flex="1">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.100"
                      noOfLines={1}
                    >
                      {currentUser?._id === user?._id ? "You" : user.username}
                    </Text>
                  </Box>
                  <Flex
                    align="center"
                    bg={
                      connectedUsers.some(
                        (connectedUser) => connectedUser._id === user._id
                      )
                        ? "green.100"
                        : "red.100"
                    }
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    <Icon
                      as={FiCircle}
                      color={
                        connectedUsers.some(
                          (connectedUser) => connectedUser._id === user._id
                        )
                          ? "green"
                          : "red"
                      }
                      fontSize="8px"
                      mr={1}
                    />
                    <Text
                      fontSize="xs"
                      color={
                        connectedUsers.some(
                          (connectedUser) => connectedUser._id === user._id
                        )
                          ? "green"
                          : "red"
                      }
                      fontWeight="medium"
                    >
                      {connectedUsers.some(
                        (connectedUser) => connectedUser._id === user._id
                      )
                        ? "online"
                        : "offline"}
                    </Text>
                  </Flex>
                </Flex>
              </Tooltip>
            </Box>
          ))}
        </VStack>
      </Box>

      {/*watch header*/}
      <Flex
        p={5}
        bg="gray.900"
        align="center"
        position="sticky"
        top={0}
        zIndex={1}
        boxShadow="sm"
      >
        <Icon as={IoEyeOutline} fontSize="20px" color="yellow.400" mr={2} />
        <Text fontSize="lg" fontWeight="bold" color="gray.100">
          Watch List
        </Text>
        <Badge
          ml={2}
          colorScheme="yellow"
          borderRadius="full"
          px={2}
          py={0.5}
          fontSize="xs"
        >
          {
            connectedUsers.filter(
              (cu) => !allGroupUsers.some((gu) => gu._id === cu._id)
            ).length
          }
        </Badge>
      </Flex>

      {/* Watch list*/}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        maxH="35%"
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
        <VStack overflowY="auto" align="stretch" maxH="100%" spacing={3}>
          {connectedUsers
            .filter((cu) => !allGroupUsers.some((gu) => gu._id === cu._id))
            .map((user) => (
              <Box key={user._id}>
                <Tooltip
                  label={`${user.username} is Watching`}
                  placement="left"
                >
                  <Flex
                    p={3}
                    bg="gray.700"
                    borderRadius="lg"
                    shadow="sm"
                    align="center"
                  >
                    <Avatar
                      size="sm"
                      name={user.username}
                      bg="gray.400"
                      color="black"
                      mr={3}
                    />
                    <Box flex="1">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.100"
                        noOfLines={1}
                      >
                        {currentUser?._id === user?._id ? "You" : user.username}
                      </Text>
                    </Box>
                    <Flex
                      align="center"
                      bg="gray.300"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      <Icon as={FiCircle} color="black" fontSize="8px" mr={1} />
                      <Text fontSize="xs" color="black" fontWeight="medium">
                        Watching
                      </Text>
                    </Flex>
                  </Flex>
                </Tooltip>
              </Box>
            ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default UsersList;
