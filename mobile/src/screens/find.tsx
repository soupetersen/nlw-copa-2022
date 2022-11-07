import { Heading, useToast, VStack } from "native-base";
import { useState } from "react";

import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export function Find() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setcode] = useState("");

  const { navigate } =  useNavigation();
  const toast = useToast();

  async function handleJoinPoll() {

    try {
      setIsLoading(true);

      if (!code.trim()) {
        return toast.show({
          title: "Digite o código do bolão",
          placement: "top",
          bgColor: "red.500",
        });
      }
      
      await api.post("/polls/join", {
        code,
      });

      toast.show({
        title: "Você entrou no bolão com sucesso",
        placement: "top",
        bgColor: "green.500",
      });

      navigate("polls");
    } catch (error) {
      console.log(error);

      if (error.response.status === 404) {
        return toast.show({
          title: "Não foi possível encontrar o seu bolão",
          placement: "top",
          bgColor: "red.500",
        });
      }
        
      if (error.response.status === 400) {
        return toast.show({
          title: "Você já está participando deste bolão",
          placement: "top",
          bgColor: "red.500",
        });
      }
     
      setIsLoading(false);
    }
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Buscar por código" showBackButton onShare={() => {}} />
      <VStack mt={8} mx={5} alignItems="center">
        <Heading 
          fontFamily="heading" 
          color="white" 
          fontSize="xl" 
          mb={8} 
          textAlign="center"
        >
          Encontre um bolão através de {'\n'} 
          seu código único
        </Heading>
        <Input 
          mb={2}
          placeholder="Qual o código do bolão?"
          autoCapitalize="characters"
          onChangeText={setcode}
        />
        <Button 
          title="Buscar bolão"
          onPress={handleJoinPoll}
        />
      </VStack>
    </VStack>
  )
}