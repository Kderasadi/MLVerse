import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      console.log(user);
      //history.push("/chats");
      navigate("/chats");
    }
  }, []);
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent={"center"}
        p={3}
        bg={"white"}
        borderRadius={"lg"}
        borderWidth={"1px"}
        w="100%"
        m="40px 0 15px 0"
      >
        <Text fontSize={"4xl"} color="black" textAlign={"center"}>
          Trans
        </Text>
      </Box>
      <Box p={4} bg={"white"} borderRadius={"lg"} borderWidth={"1px"} w="100%">
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList mb="1em">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Signup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login></Login>
            </TabPanel>
            <TabPanel>
              <SignUp></SignUp>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
