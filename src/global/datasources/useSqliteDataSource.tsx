import { useCallback, useState } from 'react';
import { DataSource } from 'typeorm';
import { Author } from '../../modules/examples/entities/author.entity';
import { Category } from '../../modules/examples/entities/category.entity';
import { Post } from '../../modules/examples/entities/post.entity';
import { TransactionEntry } from '../../modules/transaction-entries/entities/transaction-entry.entity';

// Read the typeorm docs for more info
const dataSource = new DataSource({
    database: "personal_transaction_manager.db", // This database is stored inside the person's phone with the filename we desire
    driver: require('expo-sqlite'),
    entities: [
        //"src/**/*.entity{.ts,.js}" //Not working. I need to investigate this further.
        Post,
        Category,
        Author,
        TransactionEntry
    ],
    synchronize: true,
    type: "expo",

});

// Problem Case: TypeORM declares how you connect with the 'DataSource'. We need to make sure it initializes only once - i.e. you make a connection to the database from your program; creating the database, entities etc. We could do this inside a useEffect, but we want to make it flexible

// What we want to do here is to make sure the connection is initialized only once. What we're doing here is creating a hook that initializes only once, then keeps the information and returns it when needed.
const useSqliteDataSource = async () => {
    const [initializedDataSource, setInitializedDataSource] = useState<DataSource | null >(null)
    // useCallback is a hook that ensures the function is loaded into memory only once.
    const initDataSource = useCallback(async () => {//useCallback is a hook to be explained in class. Meanwhile, look it up online.
        try{
            if(!initializedDataSource){ //If this data source isn't initialised, initialise it and then update the state. The only reason we used an underscore in the var name is we wanted to reuse the same name.
                const _initializedDataSource = await dataSource.initialize()
                setInitializedDataSource(_initializedDataSource);
                return _initializedDataSource;
            }else{
                return initializedDataSource; //the one in state
            }
        }catch(error){
            return null;
        }
    }, [])
    return await initDataSource();
}
export default useSqliteDataSource;