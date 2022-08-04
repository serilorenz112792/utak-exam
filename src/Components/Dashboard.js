import React, { useState, useEffect } from "react";

import { Grid, Typography } from "@material-ui/core";
import { getDocs } from "firebase/firestore";
import { itemsCollectionsRef, ordersCollectionsRef } from "../collections";
const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const fetchAdminOrders = async () => {
    try {
      const data = await getDocs(ordersCollectionsRef);
      setAdminOrders(data.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };
  const fetchItems = async () => {
    try {
      const data = await getDocs(itemsCollectionsRef);
      setItems(data.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };
  const currencyFunc = (value) => {
    let val = Math.round(Number(value) * 100) / 100;

    let parts = val.toString().split(".");

    return `$${
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (parts[1] ? "." + parts[1] : "")
    }`;
  };
  const handleTotalCost = () => {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += items[i].totalCost;
    }
    return sum;
  };

  const handleTotalSales = () => {
    let sum = 0;
    let array = [];
    adminOrders &&
      adminOrders.map((obj) =>
        obj.orders.map((order) => {
          return array.push(order);
        })
      );
    if (array.length > 0) {
      sum = array.map((data) => {
        return Number(data.orderPrice);
      });
    }
    return (
      sum &&
      sum.reduce((a, b) => {
        return a + b;
      })
    );
  };
  useEffect(() => {
    fetchItems();
    fetchAdminOrders();
  }, []);

  return (
    <div>
      <Grid spacing={4} container justifyContent="center">
        <Grid item xs={4}>
          <div
            style={{
              maxWidth: 300,
              width: 300,
              height: 130,
            }}
          >
            <Typography style={{ textAlign: "center" }} variant="h4">
              Total Orders
            </Typography>
            <Typography style={{ textAlign: "center" }} variant="h5">
              {adminOrders.length}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div
            style={{
              maxWidth: 300,
              width: 300,
              height: 130,
            }}
          >
            <Typography style={{ textAlign: "center" }} variant="h4">
              Total Sales
            </Typography>
            <Typography style={{ textAlign: "center" }} variant="h5">
              {currencyFunc(handleTotalSales())}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div
            style={{
              maxWidth: 300,
              width: 300,
              height: 130,
            }}
          >
            <Typography style={{ textAlign: "center" }} variant="h4">
              Total Cost
            </Typography>
            <Typography style={{ textAlign: "center" }} variant="h5">
              {currencyFunc(handleTotalCost())}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
