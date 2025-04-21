import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  //handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `https://harshal-chat-app-backend.onrender.com/api/user/register`,
        {
          username,
          email,
          password,
        }
      );
    
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };
  return (
    <Box
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="black"
    >
      <Box
        display="flex"
        w={["95%", "90%", "80%", "75%"]}
        maxW="1200px"
        h={["auto", "auto", "600px"]}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
      >
        {/* Left Panel - Hidden on mobile */}
        <Box
          display={["none", "none", "flex"]}
          w="50%"
          bgImage="url('https://res.cloudinary.com/dgvh8klyc/image/upload/v1745169463/ph-m-nh-t-fBWt7NIDFFg-unsplash_gr3cin.jpg')"
          bgSize="cover"
          bgPosition="center"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            p={10}
            color="white"
          >
            <Text fontSize="4xl" fontWeight="bold" mb={4}>
              Join Our Chat Community
            </Text>
            <Text fontSize="lg" maxW="400px">
              Connect with friends and start chatting instantly
            </Text>
          </Box>
        </Box>

        {/* Right Panel - Registration Form */}
        <Box
          w={["100%", "100%", "50%"]}
          p={[6, 8, 10]}
          display="flex"
          flexDirection="column"
          bg="gray.900"
          justifyContent="center"
        >
          {/* Mobile Header - Shown only on mobile */}
          <Box display={["block", "block", "none"]} textAlign="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              Create Account
            </Text>
          </Box>

          <VStack spacing={5} w="100%" maxW="400px" mx="auto">
            <FormControl id="username" isRequired>
              <FormLabel color="gray.100" fontWeight="medium">
                Username
              </FormLabel>
              <Input
                type="text"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: "yellow" }}
                _focus={{ borderColor: "yellow" }}
                placeholder="Choose a username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel color="gray.100" fontWeight="medium">
                Email
              </FormLabel>
              <Input
                type="email"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: "yellow" }}
                _focus={{ borderColor: "yellow" }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel color="gray.100" fontWeight="medium">
                Password
              </FormLabel>
              <Input
                type="password"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: "yellow" }}
                _focus={{ borderColor: "yellow" }}
                placeholder="Create a password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </FormControl>

            <Button
              colorScheme="yellow"
              width="100%"
              transform="auto"
              _hover={{ scale: 1.05 }}
              transition="transform 0.2s"
              size="lg"
              fontSize="md"
              mt={4}
              onClick={handleSubmit}
              isLoading={loading}
            >
              Create Account
            </Button>

            <Text color="gray.100" pt={4}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "white",
                  fontWeight: "500",
                  transition: "color 0.2s",
                }}
                _hover={{ color: "indigo.700" }}
              >
                Sign in
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
