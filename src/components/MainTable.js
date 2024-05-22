import React, { useEffect, useState } from "react";
import data from "../data/maps.json";
import axios from "axios";
import {useCityContext} from "../contexts/CityContext";

const d = (n) => {
    if (typeof n === "string") {
        return n;
    }
    if (n instanceof Date) {
        return n.toLocaleString();
    }
    // if n is object:
    if (n === null || n === undefined) {
        return "null";
    }
    if (typeof n === "object") {
        return JSON.stringify(n, null, 2);
    }
    if (typeof n === "number") {
        if (n > 1_000_00) {
            return `${Number(n / 1_000_000).toFixed(2)}m`.trim();
        }
        if (n > 10_000) {
            return `${Number(n / 1_000).toFixed(0)}k`.trim();
        }
        if (n > 1_000) {
            return `${Number(n / 1_000).toFixed(2)}k`.trim();
        }
        if (n < -1_000_000) {
            return `${Number(n / 1_000_000).toFixed(2)}m`.trim();
        }
        if (n < -10_000) {
            return `${Number(n / 1_000).toFixed(0)}k`.trim();
        }
        if (n < -1_000) {
            return `${Number(n / 1_000).toFixed(2)}k`.trim();
        }

        return n.toString().trim();
    }
    return String(n).trim();
};

export default function MainTable() {
    let [dataArr, setDataArr] = useState([]);
    let [isLoading, setIsLoading] = useState(true);
    let [searchText, setSearchText] = useState("");
    let {selectedCity} = useCityContext();
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "ascending",
    });

    useEffect(() => {
        getCurrentPrices();
    }, [selectedCity, searchText]);

    function getAllIdsToString(arr) {
        let allIds = "";
        arr.forEach((el) => {
            allIds += "," + el.id;
        });
        return allIds;
    }

    async function getCurrentPrices() {
        let updatedDataArr = Object.keys(data).map((key) => data[key]);
        updatedDataArr.forEach((element) => {
            element.salvageReturn = element.itemValue - element.itemValue * 0.25;
        });

        await axios
            .get(
                `https://europe.albion-online-data.com/api/v2/stats/prices/${getAllIdsToString(
                    updatedDataArr
                )}?locations=${selectedCity}`
            )
            .then((response) => {
                let marketData = response.data;
                let foundItem;

                updatedDataArr.forEach((element) => {
                    foundItem = marketData.find((item) => item.item_id === element.id);
                    element[`currentSellOrderMin`] = foundItem.sell_price_min;
                    element[`currentBuyOrderMax`] = foundItem.buy_price_max;
                    element[`instantProfit`] =
                        element.salvageReturn - element[`currentSellOrderMin`];
                    element[`buyOrderProfit`] =
                        element.salvageReturn - element[`currentBuyOrderMax`];
                });

                updatedDataArr.forEach((element) => {
                    if (element.title.includes("(Group)")) {
                        const soloMap = updatedDataArr.find(
                            (item) => item.title === element.title.replace("Group", "Solo")
                        );
                        if (!soloMap) {
                            return;
                        }
                        element.salvageReturn += soloMap.salvageReturn;
                        element[`instantProfit`] =
                            element.salvageReturn - element[`currentSellOrderMin`];
                        element[`buyOrderProfit`] =
                            element.salvageReturn - element[`currentBuyOrderMax`];
                    }
                });

                updatedDataArr.forEach((element) => {
                    if (element.title.includes("(Large Group)")) {
                        const groupMap = updatedDataArr.find(
                            (item) => item.title === element.title.replace("Large ", "")
                        );
                        if (!groupMap) {
                            return;
                        }
                        element.salvageReturn += groupMap.salvageReturn;
                        element[`instantProfit`] =
                            element.salvageReturn - element[`currentSellOrderMin`];
                        element[`buyOrderProfit`] =
                            element.salvageReturn - element[`currentBuyOrderMax`];
                    }
                });

                updatedDataArr.forEach((element) => {
                    if (element[`currentSellOrderMin`] === 0) {
                        element[`instantProfit`] = 0;
                    }
                });

                updatedDataArr.filter(
                    (item) => item.title.toLowerCase().includes(searchText.toLowerCase())
                );

                setDataArr(
                    updatedDataArr.filter(
                        (item) =>
                            searchText === "" ||
                            item.title.toLowerCase().includes(searchText.toLowerCase())
                    )
                );
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("There was an error making the request:", error);
            });
    }

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const sortedDataArr = [...dataArr].sort((a, b) => {
        if (sortConfig.key !== null) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
        }
        return 0;
    });

    return (
        <>
            {isLoading ? (
                <img src="https://i.gifer.com/ZKZg.gif" alt="Loading..." />
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <table className="main-table">
                        <thead>
                        <tr>
                            <th>Icon</th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort("title")}
                            >
                                Name
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort("itemValue")}
                            >
                                Item Value
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort("salvageReturn")}
                            >
                                Salvage Return
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort(`currentSellOrderMin`)}
                            >
                                Current Sell Order
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort(`currentBuyOrderMax`)}
                            >
                                Current Buy Order
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort(`instantProfit`)}
                            >
                                Instant Profit
                            </th>
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => requestSort(`buyOrderProfit`)}
                            >
                                Buy order profit
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedDataArr.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img
                                        className="item-icon"
                                        src={`https://render.albiononline.com/v1/item/${item.id}`}
                                        alt="icon"
                                    />
                                </td>
                                <td>{item.title}</td>
                                <td>{item.itemValue}</td>
                                <td>{item.salvageReturn}</td>

                                <>
                                    <td>{d(item[`currentSellOrderMin`])}</td>
                                    <td>{d(item[`currentBuyOrderMax`])}</td>
                                    <td style={{color: item[`instantProfit`] > 0 ? "lime" : "red"}}>{d(item[`instantProfit`])} </td>
                                    <td style={{color: item[`buyOrderProfit`] > 0 ? "lime" : "red"}}>{d(item[`buyOrderProfit`])}</td>
                                </>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
