import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { DataSource } from 'typeorm';
import { TransactionEntry } from './entities/transaction-entry.entity';
import { Text, Button, Icon } from '@rneui/base';
import { createTransactionEntry, deleteTransactionEntry, getTransactionEntries, transformEntriesToDateSections } from './services/transaction-entry.service';
import { DisplayOptions, ISettings } from './types/definitions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EntryFlatList from './components/EntryFlatList';
import Spreadsheet from './components/Spreadsheet';
import EntrySectionList from './components/EntrySectionList';
import AddEntry from './components/AddEntry';
import Settings from './components/Settings';

type Props = {
    dataSource: DataSource;
}

const TransactionEntryHome: React.FC<Props> = ({ dataSource }) => {

    //As usual, we need to state manage
    const [transactionEntries, setTransactionEntries] = useState<TransactionEntry[]>([]);
    const [onAddEntry, setOnAddEntry] = useState<boolean>(false);

    //for settings. illustrating object in state here
    const [settings, setSettings] = useState<ISettings>({
        displayOption: DisplayOptions.SECTION_LIST_BY_DATE,
        onSettings: false
    })

    /**
   * Function to create a new entry
   * @param transactionEntryData 
   */
    const createEntry = (transactionEntryData: TransactionEntry) => {
        createTransactionEntry(dataSource, transactionEntryData, transactionEntries, setTransactionEntries, setOnAddEntry);
    }

    /**
     * Function to handle cancel of attempted create. Simply provokes close of AddEntry
     */
    const cancelCreateEntry = () => {
        setOnAddEntry(false);
    }

    /**
     * Function called to delete an Entry
     * @param id 
     */
    const deleteEntry = (id: number) => {
        deleteTransactionEntry(dataSource, id, transactionEntries, setTransactionEntries);
    }

    const handleSetDisplayOption = (displayOption: DisplayOptions) => {
        setSettings({ ...settings, displayOption, onSettings: false })
    }

    const handleCancelSetSetting = () => {
        setSettings({ ...settings, onSettings: false })
    }

    const getDisplayOption = async () => {
        try {
            const value = await AsyncStorage.getItem('displayOption');
            if (value !== null) {
                // value previously stored
                setSettings({ ...settings, displayOption: parseInt(value) })
            } else {
                //return default option
                setSettings({ ...settings, displayOption: DisplayOptions.SECTION_LIST_BY_DATE })
            }
        } catch (e) {
            // error reading value
        }
    }

    /*Memoize to ensure non repetitive loading of function */
    const setDisplayOption = useCallback(() => getDisplayOption(), []);

    /**
   * Use memoized called to transform entries to date sections. 
   * As it is a complex operation, it is good to memoize it and
   * give condition in square bracket under which the function
   * will rerun
   */
  
    const getEntriesInDateSections = useMemo(() => {
        return transformEntriesToDateSections(transactionEntries)
    }, [transactionEntries.values()]);//only run anew if entries in state change. Notice the .values()

    /**
       * Check choice of display and prepare entries for display
       */
    const displayEntries = () => {
        switch (settings.displayOption) {
            case DisplayOptions.FLAT_LIST: return <EntryFlatList entries={transactionEntries} deleteEntry={deleteEntry} />
            case DisplayOptions.SPREADSHEET: return <Spreadsheet entries={transactionEntries} deleteEntry={deleteEntry} />
            default: return <EntrySectionList entriesInDateSections={getEntriesInDateSections} deleteEntry={deleteEntry} />
        }
    }

    //prepare the function that will getTransactionEntries
    //Below moved to transaction-entry.services.ts for better modularity
    /*
    const getTransactionEntries = async () => {
        try {
            const transactionEntryRepository: Repository<TransactionEntry> = dataSource.getRepository(TransactionEntry);
            let transactionEntries = await transactionEntryRepository.find();
            //Below really should not be here. It is just to load some fictitious data for quick test of our data source.
            if (transactionEntries.length === 0) {
                const newTransactionEntry = new TransactionEntry();
                newTransactionEntry.description = 'Just a sample entry';
                newTransactionEntry.amount = 1000;
                await transactionEntryRepository.save(newTransactionEntry);
                transactionEntries = await transactionEntryRepository.find();
            }
            setTransactionEntries(transactionEntries);
        } catch (error) {
            setTransactionEntries([]); //None available due to error
        }
    }
    */

    useEffect(() => {
        //getTransactionEntries(); //before moving the function out of this file
        getTransactionEntries(dataSource, setTransactionEntries);
        setDisplayOption();
    }, [])//run once

    return (
        <>
          <Text h2>My Personal Transactions</Text>
          
          {/* The View below wraps a menu made up of two menu items - Add new and Settings. We could have used React Navigation to better handle this */}
          <View style={{ flexDirection: 'row', padding: 9 }}>
            {!onAddEntry &&
              <Button
                icon={
                  <Icon
                    name="add"
                    color="green"
                  />
                }
                title="Add Entry"
                titleStyle={{ color: 'green', fontWeight: 'bold' }}
                type="clear"
                onPress={() => setOnAddEntry(true)  }
              />
            }
            {!settings.onSettings &&
              <Button
                icon={
                  <Icon
                    name="settings"
                    color="green"
                  />
                }
                title="Settings"
                titleStyle={{ color: 'green', fontWeight: 'bold' }}
                type="clear"
                onPress={() => { setSettings({ ...settings, onSettings: true }) }}
              />
            }
          </View>
    
          {/* Below, we conditionally display AddEntry */}
          {onAddEntry && <AddEntry createEntry={createEntry} cancelCreateEntry={cancelCreateEntry} />}
    
          {/* Below, we conditionally display Settings window where we set only display options for now */}
          {settings.onSettings && <Settings setDisplayOption={handleSetDisplayOption} cancelSetSetting={handleCancelSetSetting} />}
    
          {/* Display entries as already predetermined in the function defined before return above, named displayEntries. Check it out again */}
          {displayEntries()}
    
          {/* Below is just a footer message */}
          <Text style={{ fontSize: 14, fontStyle: "italic", paddingTop: 10 }}>Copyright: Pius Onobhayedo</Text>
          </>
      );
    }

   export default TransactionEntryHome;