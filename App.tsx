import { useEffect, useState } from 'react';
import { View, Image, FlatList, Dimensions } from 'react-native';
import { supabase } from './lib/supabase';

type Post = { id: string; url: string };

export default function App() {
  const [items, setItems] = useState<Post[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id,url')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setItems(data);
      console.log('load', { len: data?.length, error });
    })();
  }, []);

  const w = Dimensions.get('window').width;
  return (
    <FlatList
      data={items}
      keyExtractor={(x) => x.id}
      renderItem={({ item }) => (
        <View style={{ padding: 8 }}>
          <Image
            source={{ uri: item.url }}
            style={{ width: w - 16, height: (w - 16) * 0.66, borderRadius: 12 }}
            resizeMode="cover"
          />
        </View>
      )}
    />
  );
}
