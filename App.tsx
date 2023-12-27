import { Alert, Button, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device';
import {
  NotificationContentInput,
  NotificationRequestInput
} from 'expo-notifications';
import { useEffect, useState } from 'react';

async function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true
    }
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true
    }
  }
})


export default function App() {
  const [triggerMessage, setTriggerMessage] = useState<boolean>(false)
  useEffect(() => {
    async function reqPermission() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C'
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          const errorMessage = `Failed to get push token for push notification. Status: ${finalStatus}`;
          console.error(errorMessage);
          Alert.alert(errorMessage);
          return;
        }


        const token = await Notifications.getExpoPushTokenAsync({
          projectId: '77ee40cb-98bf-400a-8b17-cfa1014dcdb8'
        });

        console.log('Expo Push Token:', token.data);
      } else {
        Alert.alert('Must use a physical device for Push Notifications');
      }
    }


    reqPermission()
  }, []);


  useEffect(() => {
    // this function is triggered when the notification is sent to the user
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data.userName
      console.log('DATAAAAA', data)
    });

    // this function is triggered when the user responds(clicks) the notification
    const subscription1 = Notifications.addNotificationResponseReceivedListener((response) => {
      setTriggerMessage(true)
      const res = response
      console.log('RESPONSEEEEE', res)
    })

    return () => {
      // should be used when the component is removed
      subscription.remove()
      subscription1.remove()
      setTriggerMessage(false)
    }
  }, []);

  async function scheduleNotificationHandler() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'hello world',
        body: 'my first local notification',
        data: { userName: 'Auron' }
      } as NotificationContentInput,
      trigger: {
        seconds: 5
      }
    } as NotificationRequestInput)
  }

  function sendPushNotificationHandler() {
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'ExponentPushToken[ybLscFIlAMaEYHGGo6rgBZ]',
        title: 'you have an email',
        body: 'check your mail'
      })
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'default'}/>
      <Text style={{
        marginBottom: 10
      }}>Click and wait 5 seconds</Text>
      <Button onPress={scheduleNotificationHandler} title={'Schedule notification'}/>
      {triggerMessage && <Text style={{ margin: 5 }}> I am written after the user has clicked the notification</Text>}
      <Button onPress={sendPushNotificationHandler} title={'Send Push Notification'}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
