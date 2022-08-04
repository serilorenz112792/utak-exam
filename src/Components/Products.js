import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import {
  Add,
  ArrowBack,
  Delete,
  EditOutlined,
  ShoppingBasket,
} from "@material-ui/icons";
import uuid from "react-uuid";
import { db } from "../db";
import { itemsCollectionsRef } from "../collections";
import { getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
const styles = () => ({
  root: {
    padding: 20,
  },
  title: {
    textAlign: "center",
  },
  imageStyle: {
    width: "inherit",
    height: " 400px",
  },
  starterText: {
    fontSize: "1rem",
  },
  categoryTextGrid: {
    paddingBottom: 20,
  },
  categoryContainerGrid: {
    paddingBottom: 20,
  },
  btnStarterGrid: {
    textAlign: "center",
  },
  backBtn: {
    cursor: "pointer",
  },
});
function Products(props) {
  const { classes, category, backBtn, userRole, guestUser } = props;
  const [apDialogState, setAPState] = useState(false);
  const [items, setItems] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState(""); // Ingredients * Quantity/Stock
  const [addOns, setAddOns] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItemForEdit, setItemForEdit] = useState({});
  const [haveSizes, setHaveSizes] = useState(false);

  const [itemSize, setItemSize] = useState("small");
  const [orderQty, setOrderQty] = useState(0);
  const [purchaseDS, setPurchaseDS] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await getDocs(itemsCollectionsRef);
      setItems(data.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const resetState = () => {
    setRecipeName("");
    setStock(0);
    setPrice(0);
    setAddOns([]);
    setCost(0);
    setHaveSizes(false);
  };

  const handleCloseAp = () => {
    setIsEdit(false);
    resetState();
    setAPState((prevState) => !prevState);
  };

  const handleOpenAp = () => {
    setAPState((prevState) => !prevState);
  };
  const handleTotalCost = () => {
    if (selectedItemForEdit.originalStock < stock) {
      return (
        selectedItemForEdit.totalCost +
        (stock - selectedItemForEdit.originalStock) * selectedItemForEdit.cost
      );
    }
    return (
      selectedItemForEdit.totalCost -
      (selectedItemForEdit.originalStock - stock) * selectedItemForEdit.cost
    );
  };
  const handleCreateItem = async () => {
    try {
      if (recipeName === "" || price === 0 || stock === 0)
        return alert("All fields are required except addons!");
      if (isNaN(price) || isNaN(stock))
        return alert("Price or Stock must be a number!");
      const itemToAdd = {
        categoryName: category.categoryName,
        id: uuid(),
        recipeName,
        stock,
        price: parseFloat(price),
        cost: parseFloat(cost),
        addOns,
        haveSizes,
        originalStock: stock,
        totalCost: stock * parseFloat(cost),
      };
      await addDoc(itemsCollectionsRef, itemToAdd);
      alert("Create successful");
      fetchItems();
      handleCloseAp();

      return;
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const itemsDoc = doc(db, "Products", id);
      await deleteDoc(itemsDoc);
      alert("Delete successful");
      fetchItems();
      return;
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleEditItem = async () => {
    try {
      if (recipeName === "" || price === 0 || stock === 0)
        return alert("All fields are required except addons!");
      if (isNaN(price) || isNaN(stock))
        return alert("Price or Stock must be a number!");
      const id = selectedItemForEdit.id;
      const newValues = {
        recipeName,
        stock,
        price: parseFloat(price),
        cost: parseFloat(cost),
        haveSizes,
        originalStock: stock,
        totalCost: handleTotalCost(),
      };
      const itemDoc = doc(db, "Products", id);
      await updateDoc(itemDoc, newValues);
      alert("Edit successful");
      fetchItems();
      handleCloseAp();
      return;
    } catch (err) {}
  };

  const currencyFunc = (value) => {
    let val = Math.round(Number(value) * 100) / 100;

    let parts = val.toString().split(".");

    return `$${
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (parts[1] ? "." + parts[1] : "")
    }`;
  };

  const handleOpenEp = () => {
    handleOpenAp();
    setIsEdit(true);
  };

  const handleItemSize = (e) => {
    setItemSize(e.target.value);
  };

  const handleOpenPurchaseD = () => {
    setPurchaseDS(true);
  };

  const handleClosePurchaseD = () => {
    setOrderQty(0);
    setItemSize("small");
    setPurchaseDS(false);
  };

  const handleAddToCart = async () => {
    let item = JSON.parse(localStorage.getItem("AddedItem"));
    if (selectedItemForEdit.stock <= 0) return alert("Out of stock!");
    if (selectedItemForEdit.stock < orderQty)
      return alert("Insufficient stock!");
    const itemDoc = doc(db, "Products", selectedItemForEdit.id);
    await updateDoc(itemDoc, { stock: selectedItemForEdit.stock - orderQty });
    let additionalFee = 0;
    if (itemSize === "medium") additionalFee = 2;
    if (itemSize === "large") additionalFee = 4;
    const newData = {
      productId: selectedItemForEdit.id,
      recipeName: selectedItemForEdit.recipeName,
      orderId: uuid(),
      qty: orderQty,
      itemSize,
      orderPrice: parseFloat(
        orderQty * (selectedItemForEdit.price + additionalFee)
      ).toFixed(2),
      username: guestUser,
      createdAt: new Date().getTime(),
    };
    let arr = item ? [newData, ...item] : [newData];
    localStorage.setItem("AddedItem", JSON.stringify(arr));
    alert("Added to cart!");
    fetchItems();
    handleClosePurchaseD();
  };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
      <PurchaseDialog
        selectedItem={selectedItemForEdit}
        itemSize={itemSize}
        setState={{ setItemSize, setOrderQty }}
        currencyFunc={currencyFunc}
        handleItemSize={handleItemSize}
        purchaseDState={purchaseDS}
        handleClosePurchaseD={handleClosePurchaseD}
        handleAddToCart={handleAddToCart}
        generateRandomColor={generateRandomColor}
      />
      <ApDialog
        isEdit={isEdit}
        dialogState={apDialogState}
        handleCloseAp={handleCloseAp}
        handleCreateItem={handleCreateItem}
        handleEditItem={handleEditItem}
        category={category}
        productstate={{ recipeName, stock, price, haveSizes, cost }}
        setState={{
          setRecipeName,
          setStock,
          setPrice,
          setAddOns,
          setHaveSizes,
          setCost,
        }}
        selectedItemForEdit={selectedItemForEdit}
      />
      <Grid className={classes.root} container justifyContent="center">
        <Grid onClick={backBtn} item xs={12}>
          <ArrowBack className={classes.backBtn} />
        </Grid>
        {/* <Typography className={classes.title} variant="h2">
          {category.categoryName}
        </Typography> */}
        <Grid className={classes.btnStarterGrid} item xs={12}>
          {userRole === "Admin" && (
            <Button onClick={handleOpenAp} variant="contained" color="primary">
              <Add />
            </Button>
          )}
        </Grid>
        <Grid container>
          <Grid className={classes.categoryTextGrid} item xs={12}>
            <Typography className={classes.starterText} variant="caption">
              STARTERS
            </Typography>
          </Grid>
          <Grid
            className={classes.categoryContainerGrid}
            container
            justifyContent="center"
            spacing={3}
          >
            {items
              .filter(
                (product) => product.categoryName === category.categoryName
              )
              .map((product, idx) => (
                <Grid key={product.id} item xs={4}>
                  <Card sx={{ maxWidth: 345 }}>
                    <div
                      style={{
                        height: 140,
                        backgroundColor: generateRandomColor(),
                      }}
                    ></div>
                    <CardContent>
                      <Typography variant="h5">{product.recipeName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <span>
                          Stocks:{" "}
                          {product.stock > 0 ? (
                            <b>{product.stock}</b>
                          ) : (
                            <span style={{ color: "red" }}>out of stock!</span>
                          )}
                        </span>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <span>
                          Price: <b>{currencyFunc(product.price)}</b>
                        </span>
                      </Typography>
                      {userRole === "Guest" && (
                        <Grid container justifyContent="center">
                          <Button
                            onClick={() => {
                              handleOpenPurchaseD();
                              setItemForEdit(product);
                            }}
                          >
                            <ShoppingBasket />
                          </Button>
                        </Grid>
                      )}
                      {userRole === "Admin" && (
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            <span>
                              Cost: <b>{currencyFunc(product.cost)}</b>
                            </span>
                          </Typography>
                          <Typography variant="caption">Have Sizes?</Typography>
                          <Switch
                            disabled
                            checked={product.haveSizes}
                            name="Have Sizes?"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardActions>
                      {userRole === "Admin" && (
                        <Grid container>
                          <Grid style={{ textAlign: "center" }} item xs={6}>
                            <Tooltip title="Edit item" placement="bottom">
                              <Button
                                onClick={() => {
                                  handleOpenEp();
                                  setItemForEdit(product);
                                  setRecipeName(product.recipeName);
                                  setPrice(product.price);
                                  setStock(product.stock);
                                  setHaveSizes(product.haveSizes);
                                  setCost(product.cost);
                                }}
                              >
                                <EditOutlined />
                              </Button>
                            </Tooltip>
                          </Grid>
                          <Grid style={{ textAlign: "center" }} item xs={6}>
                            <Tooltip title="Delete Item" placement="bottom">
                              <Button
                                onClick={() => handleDeleteItem(product.id)}
                              >
                                <Delete />
                              </Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
Products.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(Products);

const PurchaseDialog = (props) => {
  const {
    selectedItem,
    itemSize,
    setState,
    currencyFunc,
    handleItemSize,
    purchaseDState,
    handleClosePurchaseD,
    handleAddToCart,
    generateRandomColor,
  } = props;
  return (
    <Dialog open={purchaseDState} onClose={handleClosePurchaseD}>
      <DialogContent>
        <Card sx={{ maxWidth: 345 }}>
          <div
            style={{
              height: 140,
              backgroundColor: generateRandomColor(),
            }}
          ></div>
          <CardContent>
            <Typography variant="h5">{selectedItem.recipeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              <span>
                Stocks:{" "}
                {selectedItem.stock > 0 ? (
                  <b>{selectedItem.stock}</b>
                ) : (
                  <span style={{ color: "red" }}>out of stock!</span>
                )}
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <span>
                Price: <b>{currencyFunc(selectedItem.price)}</b>
              </span>
            </Typography>
            <Grid container>
              <Grid style={{ paddingBottom: 20 }} item xs={12}>
                <TextField
                  fullWidth
                  label="Qty"
                  placeholder="Enter qty"
                  type="number"
                  onChange={(e) => setState.setOrderQty(e.target.value)}
                />
              </Grid>
              {selectedItem.haveSizes && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Size</FormLabel>
                  <RadioGroup
                    aria-label="size"
                    name="size"
                    value={itemSize}
                    onChange={handleItemSize}
                  >
                    <FormControlLabel
                      value="small"
                      control={<Radio />}
                      label="Small"
                    />
                    <FormControlLabel
                      value="medium"
                      control={<Radio />}
                      label="Medium (additional $2)"
                    />
                    <FormControlLabel
                      value="large"
                      control={<Radio />}
                      label="Large (additional $4)"
                    />
                  </RadioGroup>
                </FormControl>
              )}
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddToCart} variant="contained" color="primary">
          Add to Cart
        </Button>
        <Button onClick={handleClosePurchaseD} variant="text">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ApDialog = (props) => {
  const {
    dialogState,
    handleCloseAp,
    category,
    setState,
    handleCreateItem,
    isEdit,
    handleEditItem,
    productstate,
  } = props;

  return (
    <Dialog
      open={dialogState}
      onClose={handleCloseAp}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Typography style={{ textAlign: "center" }} variant="h4">
          {!isEdit ? `Add item` : `Edit item`}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <TextField
              //defaultValue={!isEdit ? "" : selectedItemForEdit.recipeName}
              value={productstate.recipeName}
              fullWidth
              placeholder="e.g Sinigang"
              label={`${category.categoryName} Name`}
              onChange={(e) => setState.setRecipeName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              //defaultValue={!isEdit ? "" : selectedItemForEdit.stock}
              value={productstate.stock}
              fullWidth
              placeholder="Enter number of stocks"
              label="Stocks"
              onChange={(e) => setState.setStock(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              //defaultValue={!isEdit ? "" : selectedItemForEdit.price}
              value={productstate.price}
              fullWidth
              placeholder="Enter item price"
              label="Item Price"
              onChange={(e) => setState.setPrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              //defaultValue={!isEdit ? "" : selectedItemForEdit.price}
              value={productstate.cost}
              fullWidth
              placeholder="Enter item cost"
              label="Item Cost"
              onChange={(e) => setState.setCost(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">Have Sizes?</Typography>
            <Switch
              checked={productstate.haveSizes}
              onChange={(e) => setState.setHaveSizes(e.target.checked)}
              name="Have Sizes?"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={!isEdit ? handleCreateItem : handleEditItem}
          variant="contained"
          color="primary"
        >
          {!isEdit ? "Create" : "Edit"}
        </Button>
        <Button onClick={handleCloseAp} variant="text">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
