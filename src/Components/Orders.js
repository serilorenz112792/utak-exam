import React, { useState, useEffect } from "react";
import { ArrowBack, Delete } from "@material-ui/icons";
import {
  Grid,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@material-ui/core";
import { itemsCollectionsRef, ordersCollectionsRef } from "../collections";
import { getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../db";
import uuid from "react-uuid";
const OrdersPage = (props) => {
  const { backBtn, userRole, guestUser } = props;

  const [orders, setOrders] = useState();
  const [products, setProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const title = guestUser ? `${guestUser}'s Cart` : `My Cart`;

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
      setProducts(data.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };
  const fetchData = () => {
    let myData = [];
    if (userRole === "Guest") {
      let arr = JSON.parse(localStorage.getItem("AddedItem"));
      myData = arr && arr.filter((val, idx) => val.username === guestUser);
      setOrders(myData);
    } else {
      setOrders(adminOrders);
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
  const handleRemoveOrder = async (order) => {
    try {
      let item = orders;

      const selectedProduct = products.filter(
        (product) => product.id === order.productId
      );
      const itemDoc = doc(db, "Products", selectedProduct[0].id);

      await updateDoc(itemDoc, {
        stock: selectedProduct[0].stock + Number(order.qty),
      });

      let arr = item.filter((itm) => itm.orderId !== order.orderId);

      localStorage.setItem("AddedItem", JSON.stringify(arr));
      fetchData();
      alert(`Remove item successful!`);
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleBuyOrders = async () => {
    const ordersToSave = {
      orders,
      orderBy: guestUser,
      id: uuid(),
      createdAt: new Date().getTime(),
    };
    try {
      await addDoc(ordersCollectionsRef, ordersToSave);
      localStorage.removeItem("AddedItem");
      fetchAdminOrders();
      fetchData();
      alert("Purchased!");
      return;
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  useEffect(() => {
    fetchData();

    fetchItems();
    fetchAdminOrders();
  }, [userRole, guestUser]);

  let array = [];
  let arrayTwo = [];
  let dataToMap = adminOrders;
  dataToMap.map((obj) => {
    return obj.orders.map((order) => {
      let createdAt = obj.orderBy === order.username && obj.createdAt;

      return array.push({ purchaseId: obj.id, createdAt, listOfOrders: order });
    });
  });

  orders &&
    orders.map((obj) => {
      return arrayTwo.push({ createdAt: obj.createdAt, listOfOrders: obj });
    });

  const dataToDisplay = userRole === "Admin" ? array : arrayTwo;

  return (
    <div>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Tooltip title="Back to categories" placement="bottom">
            <Button onClick={backBtn}>
              <ArrowBack style={{ cursor: "pointer" }} />
            </Button>
          </Tooltip>
        </Grid>
        <Grid style={{ paddingBottom: 20 }} item xs={12}>
          {userRole === "Guest" ? (
            <Typography variant="h4">{title}</Typography>
          ) : (
            <Typography variant="h4">List of Orders</Typography>
          )}
        </Grid>
        {dataToDisplay && dataToDisplay.length > 0 ? (
          <Grid container justifyContent="center">
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      {userRole === "Admin" && (
                        <TableCell>Purchased By</TableCell>
                      )}
                      <TableCell>Item Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Item Size</TableCell>
                      <TableCell>Price</TableCell>
                      {userRole === "Guest" && <TableCell>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataToDisplay &&
                      dataToDisplay
                        .sort((a, b) => {
                          return b.createdAt - a.createdAt;
                        })
                        .map((order) => (
                          <TableRow key={order.listOfOrders.orderId}>
                            <TableCell>{order.listOfOrders.orderId}</TableCell>
                            {userRole === "Admin" && (
                              <TableCell>
                                {order.listOfOrders.username}
                              </TableCell>
                            )}
                            <TableCell>
                              {order.listOfOrders.recipeName}
                            </TableCell>
                            <TableCell>{order.listOfOrders.qty}</TableCell>
                            <TableCell>{order.listOfOrders.itemSize}</TableCell>
                            <TableCell>
                              {currencyFunc(order.listOfOrders.orderPrice)}
                            </TableCell>
                            {userRole === "Guest" && (
                              <TableCell>
                                <Tooltip title="Remove item" placement="bottom">
                                  <Button
                                    onClick={() => handleRemoveOrder(order)}
                                  >
                                    <Delete />
                                  </Button>
                                </Tooltip>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid style={{ textAlign: "right", paddingTop: 20 }} item xs={12}>
              {userRole === "Guest" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBuyOrders}
                >
                  Buy Items
                </Button>
              )}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h2">No Orders!</Typography>
        )}
      </Grid>
    </div>
  );
};

export default OrdersPage;
