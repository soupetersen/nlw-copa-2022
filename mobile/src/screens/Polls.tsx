import { VStack, Icon, useToast, FlatList } from "native-base";
import { useCallback, useState} from "react";
import { Octicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";


import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { api } from "../services/api";
import { PollCard, PollProps } from "../components/PollCard";
import { Loading } from "../components/Loading";
import { EmptyPollList } from "../components/EmptyPollList";


export function Polls() {
  const [isLoading, setIsLoading] = useState(true);
  const [polls, setPolls] = useState<PollProps[]>([]);
  const { navigate } = useNavigation();
  const toast = useToast();

  async function fetchPolls() {
    try {
      setIsLoading(true);
      const response = await api.get("/polls");
      setPolls(response.data.polls);
    } catch (error) {
      console.log(error);
      toast.show({
        title: "Não foi possível carregar os bolões",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchPolls();
  }, []));

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Meus bolões" onShare={() => {}}/>
      <VStack 
        mt={6} 
        mx={5} 
        borderBottomWidth={1} 
        borderBottomColor="gray.600" 
        pb={4} 
        mb={4}
      >
        <Button 
          title="Buscar bolão por código" 
          leftIcon={<Icon as={Octicons} name="search" size="md" color="black" />}
          onPress={() => navigate("find")}
        />
      </VStack>
      { isLoading ? (
        <Loading />
        ) : (
          <FlatList 
            data={polls} 
            keyExtractor={item => item.id}
            px={5}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            ListEmptyComponent={EmptyPollList}
            renderItem={({ item }) => (
              <PollCard
                data={item}
                onPress={() => navigate("details", { id: item.id })}
                />
            )}
          />
        )
      }
    </VStack>
  )
}