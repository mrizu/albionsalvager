import React, {useEffect, useState} from 'react';
import data from '../data/maps.json';
import axios from "axios";

export default function MainTable () {
    const [dataArr, setDataArr] = useState([]);
    let [isLoading, setIsLoading] = useState(true);
    let [hiddenItemsCounter, setHiddenItemsCounter] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        getCurrentPrices();
    }, []);


    function getAllIdsToString(arr){
        let allIds = "";
        arr.forEach((el) => {
            allIds += "," + el.id
        })
        return allIds
    }

    async function getCurrentPrices(){
        let updatedDataArr = Object.keys(data).map((key) => data[key]);
        updatedDataArr.forEach((element) => {
            element.salvageReturn = element.itemValue - element.itemValue * 0.25
        })

        await axios.get(`https://europe.albion-online-data.com/api/v2/stats/prices/${getAllIdsToString(updatedDataArr)}?locations=Brecilien,Bridgewatch`)
            .then(response => {
                let marketData = response.data
                let foundItem

                updatedDataArr.forEach((element) => {
                    foundItem = marketData.find((item) => item.item_id === element.id && item.city === 'Brecilien');
                    element.currentPriceBrecilien = foundItem.sell_price_min;
                    element.profitBrecilien = element.salvageReturn - element.currentPriceBrecilien
                })

                updatedDataArr.forEach((element) => {
                    foundItem = marketData.find((item) => item.item_id === element.id && item.city === 'Bridgewatch');
                    element.currentPriceBridgewatch = foundItem.sell_price_min;
                    element.profitBridgewatch = element.salvageReturn - element.currentPriceBridgewatch
                })

                const countBeforeFilter = updatedDataArr.length;

                updatedDataArr = updatedDataArr.filter((element) => {
                    return element.currentPriceBrecilien !== 0 || element.currentPriceBridgewatch !== 0;
                })

                setDataArr(updatedDataArr)
                setHiddenItemsCounter(countBeforeFilter - updatedDataArr.length);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('There was an error making the request:', error);
            });
    }

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedDataArr = [...dataArr].sort((a, b) => {
        if (sortConfig.key !== null) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    });

    return (
        <>
            {isLoading ? (
                <img src="https://i.gifer.com/ZKZg.gif" alt="Loading..."/>
            ) : (
                <div>
                    <table className="main-table">
                        <thead>
                        <tr>
                            <th>Icon</th>
                            <th onClick={() => requestSort('title')}>Name</th>
                            <th onClick={() => requestSort('itemValue')}>Item Value</th>
                            <th onClick={() => requestSort('salvageReturn')}>Salvage Return</th>
                            <th onClick={() => requestSort('currentPriceBrecilien')}>Current Price {'\n'} (Brecilien)</th>
                            <th onClick={() => requestSort('currentPriceBridgewatch')}>Current Price {'\n'} (Bridgewatch)</th>
                            <th onClick={() => requestSort('profitBrecilien')}>Profit {'\n'} (Brecilien)</th>
                            <th onClick={() => requestSort('profitBridgewatch')}>Profit {'\n'} (Bridgewatch)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedDataArr.map((item) => (
                            <tr key={item.id}>
                                <td><img className="item-icon" src={`https://render.albiononline.com/v1/item/${item.id}`} alt="icon"/></td>
                                <td>{item.title}</td>
                                <td>{item.itemValue}</td>
                                <td>{item.salvageReturn}</td>
                                <td>{item.currentPriceBrecilien}</td>
                                <td>{item.currentPriceBridgewatch}</td>
                                <td>{item.profitBrecilien}</td>
                                <td>{item.profitBridgewatch}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="hidden-items-counter">Items hidden (none on both markets): {hiddenItemsCounter}</div>
                </div>
            )}
        </>
    )
}