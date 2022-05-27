import 'reflect-metadata';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
//import ExamplesHome from './src/modules/examples/ExamplesHome';
import TransactionEntryHome from './src/modules/transaction-entries/TransactionEntryHome';
import useSqliteDataSource from './src/global/datasources/useSqliteDataSource';
import { DataSource } from 'typeorm';
import { Text } from '@rneui/base';

const App: React.FC = () => {

  //Bring the custom hook we wrote into this Component for use. To be explained in class
  const sqliteDataSource = useSqliteDataSource();

  //We need to hold the dataSource once opened, so we can pass it to components for connection.
  const [dataSource, setDataSource] = useState<DataSource | null>(null)

  //declare the function that we will use to get data source from the hook
  const getDataSource = async () => {
    try {
      const dataSource = await sqliteDataSource;
      setDataSource(dataSource); //success! save in state
    } catch (error) {
      setDataSource(null); //problem! set null in state
    }
  }

  useEffect(() => {
    getDataSource(); //to be called only once.
  }, [])

  //Prepare our conditional display. What we display will depend on whether dataSource is available or not
  const display = () => {
    if (dataSource) {
      return (
        <>
          <TransactionEntryHome dataSource={dataSource} />
          {/*<ExamplesHome dataSource={dataSource} />*/}
        </>
      )
    } else {
      return (
        <Text>
          Cannot find data source
        </Text>
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {display()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, color: 'black' },
});

export default App;